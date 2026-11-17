import { contributions, GITHUB_ACCOUNTS } from '../data/contributions.js'
import { eyebrow } from '../data/sections.js'

/**
 * "Code Contributions" — the real GitHub activity of BOTH accounts that belong
 * to Mark (KeiShirogane1 and TheNFCGuy), added together per day.
 *
 * The data is a generated snapshot (src/data/contributions.js) produced by
 * `node tools/fetch-contributions.mjs` from GitHub's own contribution
 * calendars. Nothing is invented here: the totals, the active days, the busiest
 * days and the empty days all come from that file.
 *
 * Days with no contributions render as flat empty squares on purpose, and the
 * count of them is printed under the grid — the year is shown as it really is.
 *
 * Plain DOM elements rather than a canvas, so the grid scales at any width,
 * keeps readable tooltips, and cannot fail mid-paint.
 */

const LEVEL_CLASS = ['is-0', 'is-1', 'is-2', 'is-3', 'is-4']
const WEEKDAY_ROWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Split the flat day list into week columns, Sunday first. */
function toWeeks(days) {
  const weeks = []
  let current = null

  days.forEach((day) => {
    if (day.weekday === 0 || !current) {
      current = []
      weeks.push(current)
    }
    current.push(day)
  })

  // Pad the first week so every column has seven rows lined up with the labels.
  if (weeks.length && weeks[0].length < 7 && weeks[0][0]) {
    const pad = weeks[0][0].weekday
    weeks[0] = Array.from({ length: pad }, () => null).concat(weeks[0])
  }

  return weeks
}

function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00Z`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function dayTitle(day) {
  if (day.offGithub) {
    return `Off-GitHub development activity${day.offGithubNote ? `: ${day.offGithubNote}` : ''} on ${formatDate(day.date)}`
  }
  if (!day.count) return `No commits on ${formatDate(day.date)}`
  return `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDate(day.date)}`
}

export default function ContributionGraph() {
  const weeks = toWeeks(contributions.days)
  const { total, activeDays, emptyDays, bestDay, busiestDays } = contributions
  const allDays = activeDays + emptyDays

  // `rendered` collects the labels that actually get printed, so two months
  // assigned to the same week column never print on top of each other.
  const rendered = []

  return (
    <section className="contrib" id="activity" aria-labelledby="activity-title">
      <div className="contrib__inner">
        <header className="contrib__header">
          <div className="contrib__heading">
            <span className="contrib__badge">{eyebrow('activity')}</span>
            <h2 className="contrib__title" id="activity-title">
              Code <em className="contrib__title-em">Contributions</em>
            </h2>
            <p className="contrib__sub">
              My real GitHub activity across both accounts, added together, so one
              square is the work I did on any account that day. Squares with no
              commits are left empty rather than hidden.
            </p>
          </div>

          <div className="contrib__totals">
            <span className="contrib__total-value">{total.toLocaleString('en-US')}</span>
            <span className="contrib__total-label">contributions in the last year</span>
            <ul className="contrib__accounts">
              {GITHUB_ACCOUNTS.map((account) => (
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

        <div
          className="contrib__graph"
          style={{ '--contrib-cols': weeks.length }}
          role="img"
          aria-label={`${total} contributions on ${activeDays} of ${allDays} days between ${formatDate(contributions.windowStart)} and ${formatDate(contributions.windowEnd)}`}
        >
          <div className="contrib__months">
            {contributions.months.map((month) => {
              const column = Math.floor(month.index / 7) + 2
              const previous = rendered[rendered.length - 1]
              // Same column twice would print "NOVDEC" as one word.
              if (previous && previous.column === column) return null

              const ordinal = rendered.length
              rendered.push({ column })

              return (
                <span
                  key={`${month.label}-${month.index}`}
                  /* On narrow screens every other label is hidden by CSS, so
                     "NOV DEC" never melts into "NOVDEC" when columns get thin. */
                  className={`contrib__month${ordinal % 2 ? ' contrib__month--alt' : ''}`}
                  style={{ gridColumn: column }}
                >
                  {month.label}
                </span>
              )
            })}
          </div>

          <div className="contrib__body">
            <div className="contrib__weekdays" aria-hidden="true">
              {WEEKDAY_ROWS.map((label) => (
                <span key={label} className="contrib__weekday">
                  {label}
                </span>
              ))}
            </div>

            <div className="contrib__grid">
              {weeks.map((week, columnIndex) => (
                <div className="contrib__week" key={columnIndex}>
                  {week.map((day, rowIndex) =>
                    day ? (
                      <span
                        key={day.date}
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

        <div className="contrib__footer">
          <div className="contrib__legend" aria-hidden="true">
            <span className="contrib__legend-label">Less</span>
            {LEVEL_CLASS.map((level) => (
              <span key={level} className={`contrib__cell ${level}`} />
            ))}
            <span className="contrib__legend-label">More</span>
            <span className="contrib__legend-separator">│</span>
            <span className="contrib__legend-label contrib__legend-label--off">Off-GitHub Activity</span>
            <span className="contrib__cell contrib__cell--off-github" title="Off-GitHub development activity" />
          </div>

          <p className="contrib__meta">
            <strong className="contrib__meta-strong">
              {activeDays} of {allDays} days had work
            </strong>
            {' '}· {emptyDays} days with no commits · busiest day {bestDay.count} on {formatDate(bestDay.date)}
          </p>
        </div>

        <ul className="contrib__peaks">
          {busiestDays.map((peak) => {
            const bars = Math.min(5, Math.ceil((peak.count / bestDay.count) * 5))
            return (
              <li key={peak.date} className="contrib__peak">
                <span className="contrib__peak-date">{formatDate(peak.date)}</span>
                <span className="contrib__peak-bars" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className={`contrib__peak-bar ${index < bars ? 'is-on' : ''}`} />
                  ))}
                </span>
                <span className="contrib__peak-count">{peak.count}</span>
              </li>
            )
          })}
        </ul>

        <p className="contrib__note">
          Snapshot of GitHub's own contribution calendars for {GITHUB_ACCOUNTS.map((a) => a.login).join(' and ')},
          refreshed {new Date(contributions.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.
          Private and internal contributions appear only when each profile shares them on GitHub, so the real total is likely higher.
        </p>
      </div>
    </section>
  )
}
