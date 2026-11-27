import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTRIBUTION_WINDOWS, CONTRIBUTION_META } from '../data/contributions-years.js'
import { eyebrow } from '../data/sections.js'

/**
 * "Code Contributions" — real GitHub activity from BOTH accounts Mark owns
 * (KeiShirogane1 and TheNFCGuy), one square per day.
 *
 * Every number here is measured, never invented:
 *  - public counts come from GitHub's own contribution calendars,
 *  - the official snapshot wins wherever it holds a per-day verdict,
 *  - an amber square means local git history proves you committed that day
 *    while GitHub shows nothing public for it.
 *
 * The grid is drawn as one block per year. A block starts on its first week
 * that has work, so no empty squares sit to the left, and only the year is
 * printed on top of it. A gap two rows and four squares wide separates one
 * year from the next, so 2023, 2024, 2025 and 2026 read as four clear runs on
 * one sideways-scrolling strip without ever touching.
 */

const LEVEL_CLASS = ['is-0', 'is-1', 'is-2', 'is-3', 'is-4']
const WEEKDAY_ROWS = CONTRIBUTION_META.weekdayLabels
const DAY_MS = 86400000
const SNAPSHOT_CACHE_KEY = 'portfolio:contributions:v3'
const SNAPSHOT_CACHE_TTL_MS = 15 * 60 * 1000

function isValidSnapshot(data) {
  return Boolean(
    data &&
      Array.isArray(data.windows) &&
      data.windows[0] &&
      Array.isArray(data.windows[0].active) &&
      data.windows[0].active.length > 0 &&
      Number(data.windows[0].total) > 0
  )
}

function parseISO(iso) {
  return new Date(`${iso}T00:00:00Z`)
}

function formatLongDate(iso) {
  if (!iso) return ''
  return parseISO(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function dayTitle(day) {
  if (day.offGithub) {
    return `Worked on ${formatLongDate(day.date)} — ${day.note}. GitHub shows no public contributions that day.`
  }
  return `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatLongDate(day.date)}`
}

/** Split one window into year blocks, each already trimmed at its edges. */
function buildBlocks(window) {
  const counts = new Map()
  const levels = new Map()
  const notes = new Map()
  for (const day of window.active) {
    counts.set(day.date, day.count)
    levels.set(day.date, day.level || 0)
    if (day.offGithub) notes.set(day.date, day.note)
  }

  const windowStart = parseISO(window.windowStart)
  const windowEnd = parseISO(window.windowEnd)
  const lastYear = windowEnd.getUTCFullYear()

  const blocks = []
  for (let year = windowStart.getUTCFullYear(); year <= lastYear; year += 1) {
    const yearStart = new Date(Date.UTC(year, 0, 1))
    const yearEnd = new Date(Date.UTC(year, 11, 31))
    const from = yearStart < windowStart ? windowStart : yearStart
    const to = yearEnd > windowEnd ? windowEnd : yearEnd

    // Every day of this year, split into Sunday-start week columns.
    const weeks = []
    let week = null
    for (let d = new Date(from); d <= to; d = new Date(d.getTime() + DAY_MS)) {
      const iso = d.toISOString().slice(0, 10)
      const weekday = d.getUTCDay()
      if (!week || weekday === 0) {
        week = { start: iso, days: Array(7).fill(null) }
        weeks.push(week)
      }
      week.days[weekday] = {
        date: iso,
        count: counts.get(iso) || 0,
        level: levels.get(iso) || 0,
        offGithub: notes.has(iso),
        note: notes.get(iso)
      }
    }
    if (!weeks.length) continue

    // Trim empty weeks on both edges: the block opens on the first week with
    // work, and the current year keeps its remaining days on the right.
    const hasWork = (w) => w.days.some((day) => day && (day.count > 0 || day.offGithub))
    let first = weeks.findIndex(hasWork)
    if (first < 0) first = 0
    let last = weeks.length - 1
    if (year !== lastYear) {
      while (last > first && !hasWork(weeks[last])) last -= 1
    }

    const kept = weeks.slice(first, last + 1)

    // Month label per column, printed where the month changes.
    const months = []
    let previousMonth = ''
    kept.forEach((w, column) => {
      const firstDay = w.days.find(Boolean)
      if (!firstDay) return
      const monthKey = firstDay.date.slice(0, 7)
      if (monthKey === previousMonth) return
      previousMonth = monthKey
      months.push({
        label: parseISO(firstDay.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        column
      })
    })

    let yearTotal = 0
    let activeDays = 0
    let offGithubDays = 0
    for (const w of kept) {
      for (const day of w.days) {
        if (!day) continue
        if (day.count > 0 || day.offGithub) activeDays += 1
        if (day.offGithub) offGithubDays += 1
        yearTotal += day.count
      }
    }

    blocks.push({ year, weeks: kept, months, yearTotal, activeDays, offGithubDays })
  }

  return blocks
}

export default function ContributionGraph() {
  const sectionRef = useRef(null)
  const blocksRef = useRef(null)
  const [inView, setInView] = useState(false)

  /* The strip only starts its motion once it is really on screen. The timer is
     a safety net: a missed observation can never leave the grid invisible. */
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true)
      return undefined
    }

    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      setInView(true)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          unlock()
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )
    observer.observe(node)

    const fallback = window.setTimeout(unlock, 2600)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  /* GitHub-style cross highlight. Written straight onto the container so
     sweeping the pointer over a thousand cells never re-renders React. */
  const markRow = (event) => {
    const holder = blocksRef.current
    if (!holder) return
    const cell = event.target instanceof Element ? event.target.closest('.contrib__cell') : null
    const row = cell ? cell.getAttribute('data-row') : null
    if (row === null) {
      holder.removeAttribute('data-hover-row')
      return
    }
    if (holder.getAttribute('data-hover-row') !== row) holder.setAttribute('data-hover-row', row)
  }

  const clearRow = () => {
    const holder = blocksRef.current
    if (holder) holder.removeAttribute('data-hover-row')
  }

  const [activeWindow, setActiveWindow] = useState(CONTRIBUTION_WINDOWS[0])
  const [meta, setMeta] = useState(CONTRIBUTION_META)

  /* Hydrate from Cloudflare KV (/api/contributions) with a short session cache
     and silent fallback to the bundled snapshot when running Vite-only dev or
     offline. No GitHub token ever touches the browser. */
  useEffect(() => {
    let cancelled = false

    const applySnapshot = (data) => {
      if (cancelled || !isValidSnapshot(data)) return
      setActiveWindow(data.windows[0])
      if (data.meta) {
        setMeta((prev) => ({ ...prev, ...data.meta }))
      } else if (data.lastSuccessfulRefresh || data.refreshedAt) {
        setMeta((prev) => ({
          ...prev,
          generatedAt: data.lastSuccessfulRefresh || data.refreshedAt,
          lastSuccessfulRefresh: data.lastSuccessfulRefresh || data.refreshedAt
        }))
      }
    }

    try {
      const cachedRaw = window.sessionStorage.getItem(SNAPSHOT_CACHE_KEY)
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw)
        if (cached && Date.now() - Number(cached.cachedAt || 0) < SNAPSHOT_CACHE_TTL_MS && isValidSnapshot(cached.data)) {
          applySnapshot(cached.data)
          return () => {
            cancelled = true
          }
        }
      }
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }

    fetch('/api/contributions?v=3', { cache: 'no-store', headers: { accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isValidSnapshot(data)) return
        applySnapshot(data)
        try {
          window.sessionStorage.setItem(
            SNAPSHOT_CACHE_KEY,
            JSON.stringify({ cachedAt: Date.now(), data })
          )
        } catch {
          // Ignore storage errors
        }
      })
      .catch(() => {
        // Keep bundled fallback silently (e.g. local Vite dev without Worker).
      })

    return () => {
      cancelled = true
    }
  }, [])

  const blocks = useMemo(() => buildBlocks(activeWindow), [activeWindow])

  const peaks = activeWindow.active
    .filter((day) => day.count > 0)
    .slice()
    .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))
    .slice(0, 5)

  // One row per year: that year's own total, so nobody has to add the squares up.
  const yearSummaries = blocks.map((block) => ({
    year: block.year,
    total: block.yearTotal,
    activeDays: block.activeDays,
    offGithubDays: block.offGithubDays
  }))
  const busiestYear = yearSummaries.reduce((max, item) => Math.max(max, item.total), 1)

  // A year with even one contribution keeps a lit dot, so a quiet year (2023
  // has a single contribution) never looks like it had no activity at all.
  function yearDots(total) {
    if (total <= 0) return 0
    return Math.max(1, Math.round((total / busiestYear) * 10))
  }

  return (
    <section
      className={`contrib${inView ? ' is-in' : ''}`}
      id="activity"
      aria-labelledby="activity-title"
      ref={sectionRef}
    >
      <div className="contrib__inner">
        <header className="contrib__header">
          <div className="contrib__heading">
            <span className="contrib__badge">{eyebrow('activity')}</span>
            <h2 className="contrib__title" id="activity-title">
              Code <em className="contrib__title-em">Contributions</em>
            </h2>
            <p className="contrib__sub">
              Both of my GitHub accounts added together, so one square is the work
              that landed on either account that day. Ochre squares are days I was
              coding locally while GitHub shows nothing public for them.
            </p>
          </div>

          <div className="contrib__totals">
            <span className="contrib__total-value">{activeWindow.total.toLocaleString('en-US')}</span>
            <span className="contrib__total-label">
              contributions · all time, {activeWindow.windowStart.slice(0, 4)}–
              {activeWindow.windowEnd.slice(0, 4)}
            </span>
            <ul className="contrib__accounts">
              {activeWindow.accounts.map((account) => (
                <li key={account.login} className="contrib__account">
                  <a
                    href={`https://github.com/${account.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contrib__account-link"
                  >
                    {account.label}
                    <span className="contrib__account-count">{account.total.toLocaleString('en-US')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="contrib__label">
          <span className="contrib__label-year">
            {activeWindow.windowStart.slice(0, 4)}–{activeWindow.windowEnd.slice(0, 4)}
          </span>
          <span className="contrib__label-dates">
            {formatLongDate(activeWindow.windowStart)} → {formatLongDate(activeWindow.windowEnd)}
          </span>
          <span className="contrib__label-hint">{activeWindow.hint}</span>
          <span className="contrib__label-scroll">scroll →</span>
        </div>

        <div
          className="contrib__graph"
          role="img"
          aria-label={`${activeWindow.total} contributions on ${activeWindow.activeDays} active days between ${formatLongDate(activeWindow.windowStart)} and ${formatLongDate(activeWindow.windowEnd)}`}
        >
          <div
            className="contrib__blocks"
            ref={blocksRef}
            onPointerOver={markRow}
            onPointerLeave={clearRow}
          >
            {blocks.map((block, blockIndex) => (
              <div
                className="contrib__block"
                key={block.year}
                style={{ '--block-i': blockIndex }}
              >
                <div className="contrib__block-head">
                  <span className="contrib__block-year">{block.year}</span>
                </div>

                <div
                  className="contrib__block-months"
                  style={{ '--block-cols': block.weeks.length }}
                >
                  {block.months.map((month) => (
                    <span
                      key={`${block.year}-${month.label}-${month.column}`}
                      className="contrib__month"
                      style={{ gridColumn: month.column + 2 }}
                    >
                      {month.label}
                    </span>
                  ))}
                </div>

                <div className="contrib__block-body">
                  <div className="contrib__weekdays" aria-hidden="true">
                    {WEEKDAY_ROWS.map((label) => (
                      <span key={label} className="contrib__weekday">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="contrib__grid">
                    {block.weeks.map((week, columnIndex) => (
                      <div
                        className="contrib__week"
                        key={columnIndex}
                        style={{ '--col-i': columnIndex }}
                      >
                        {week.days.map((day, rowIndex) =>
                          day ? (
                            <span
                              key={day.date}
                              data-row={rowIndex}
                              className={`contrib__cell ${LEVEL_CLASS[day.level] || 'is-0'}${
                                day.offGithub ? ' contrib__cell--off-github' : ''
                              }`}
                              title={dayTitle(day)}
                              aria-label={dayTitle(day)}
                            />
                          ) : (
                            <span key={`pad-${rowIndex}`} className="contrib__cell is-empty" />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="contrib__footer">
          <div className="contrib__legend" aria-hidden="true">
            <span className="contrib__legend-label">Less</span>
            {LEVEL_CLASS.map((level) => (
              <span key={level} className={`contrib__cell ${level}`} />
            ))}
            <span className="contrib__legend-label">More</span>
            <span className="contrib__legend-separator">│</span>
            <span className="contrib__legend-label contrib__legend-label--off">Off-GitHub Activity</span>
            <span
              className="contrib__cell contrib__cell--off-github"
              title="Off-GitHub development activity"
            />
          </div>

          <p className="contrib__meta">
            <strong className="contrib__meta-strong">{activeWindow.activeDays} days had work</strong>
            {activeWindow.offGithubDays ? ` · ${activeWindow.offGithubDays} off-GitHub` : ''} · busiest
            day {activeWindow.bestDay.count} on {formatLongDate(activeWindow.bestDay.date)}
          </p>
        </div>

        {yearSummaries.length ? (
          <ul className="contrib__years" aria-label="Contributions for each year">
            {yearSummaries.map((summary) => (
              <li key={summary.year} className="contrib__year-row">
                <span className="contrib__year-name">{summary.year}</span>
                <span className="contrib__year-spark" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <span
                      key={index}
                      style={{ '--dot-i': index }}
                      className={`contrib__year-dot ${
                        index < yearDots(summary.total) ? 'is-on' : ''
                      }`}
                    />
                  ))}
                </span>
                <span className="contrib__year-total">{summary.total.toLocaleString('en-US')}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {peaks.length ? (
          <ul className="contrib__peaks">
            {peaks.map((peak) => {
              const bars = activeWindow.bestDay.count
                ? Math.min(5, Math.ceil((peak.count / activeWindow.bestDay.count) * 5))
                : 1
              return (
                <li key={peak.date} className="contrib__peak">
                  <span className="contrib__peak-date">{formatLongDate(peak.date)}</span>
                  <span className="contrib__peak-bars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        style={{ '--bar-i': index }}
                        className={`contrib__peak-bar ${index < bars ? 'is-on' : ''}`}
                      />
                    ))}
                  </span>
                  <span className="contrib__peak-count">{peak.count}</span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <p className="contrib__note">
          {(meta.accounts || CONTRIBUTION_META.accounts).map((account) => account.login).join(' and ')} · snapshot refreshed{' '}
          {new Date(meta.lastSuccessfulRefresh || meta.generatedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
          . Private and internal contributions appear only when each profile shares them on GitHub, so the
          real total is likely higher.
        </p>
      </div>
    </section>
  )
}
