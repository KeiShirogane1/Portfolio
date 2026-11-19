import { writeFile, readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT = join(ROOT, 'src', 'data', 'contributions-years.js')
const SNAPSHOT = join(ROOT, 'src', 'data', 'contributions.js')

const ACCOUNTS = [
  { login: 'KeiShirogane1', label: 'Main' },
  { login: 'TheNFCGuy', label: 'QwerNFC' }
]
const YEARS = [] // calendar-year windows retired: one all-time window covers every year
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toISO = (d) => d.toISOString().slice(0, 10)
const weekdayOf = (iso) => new Date(iso + 'T00:00:00Z').getUTCDay()

function eachDay(from, to) {
  const days = []
  for (let d = new Date(from + 'T00:00:00Z'); toISO(d) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(toISO(d))
  }
  return days
}

/* ---------- 1. public GitHub calendars (both accounts, every year) ---------- */

async function fetchAccount(login) {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${login}`, {
    headers: { 'user-agent': 'KeiShirogane1-Portfolio-Contribution-Refresh' }
  })
  if (!res.ok) throw new Error(`${login}: calendar service HTTP ${res.status}`)
  const json = await res.json()
  if (!Array.isArray(json.contributions)) throw new Error(`${login}: unexpected calendar payload`)
  const map = new Map()
  for (const day of json.contributions) {
    if (!day || typeof day.date !== 'string') continue
    map.set(day.date, Number(day.count) || 0)
  }
  return { login, map }
}

/* ---------- 2. the official snapshot window (same numbers already on the site) ---------- */

async function readSnapshot() {
  let text = ''
  try {
    text = await readFile(SNAPSHOT, 'utf8')
  } catch {
    return null
  }
  const from = text.match(/"windowStart": "([0-9-]+)"/)
  const to = text.match(/"windowEnd": "([0-9-]+)"/)
  if (!from || !to) return null

  const accountsBlock = text.slice(text.indexOf('GITHUB_ACCOUNTS ='), text.indexOf('GITHUB_USER'))
  const accounts = []
  const accRe = /"login": "([^"]+)",\s*"label": "([^"]+)",\s*"total": (\d+)/g
  let m
  while ((m = accRe.exec(accountsBlock))) {
    accounts.push({ login: m[1], label: m[2], total: Number(m[3]) })
  }
  if (!accounts.length) return null

  // Per-day counts and the hand-written off-GitHub notes.
  const dayMap = new Map()
  const dayRe = /"date": "([0-9-]+)",\s*"weekday": \d+,\s*"count": (\d+)/g
  while ((m = dayRe.exec(text))) dayMap.set(m[1], Number(m[2]))

  const notes = new Map()
  const noteRe = /"date": "([0-9-]+)",\s*"weekday": \d+,\s*"count": \d+,\s*"level": \d+,\s*"offGithub": true/g
  while ((m = noteRe.exec(text))) {
    const tail = text.slice(m.index, m.index + 460)
    const note = tail.match(/"offGithubNote": "(.*?)"/)
    notes.set(m[1], note ? note[1] : 'Off-GitHub development activity')
  }

  return {
    from: from[1],
    to: to[1],
    total: Number((text.match(/"total": (\d+)/) || [])[1] || 0),
    accounts,
    dayMap,
    notes
  }
}

/* ---------- 3. local git history: days you committed but never reached GitHub ---------- */

async function findRepos(startDirs) {
  const found = []
  const walk = async (dir, depth) => {
    if (depth > 3) return
    let entries = []
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    if (existsSync(join(dir, '.git'))) found.push(dir)
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      await walk(join(dir, entry.name), depth + 1)
    }
  }
  for (const dir of startDirs) {
    if (!existsSync(dir)) continue
    try {
      if ((await stat(dir)).isDirectory()) await walk(dir, 0)
    } catch {
      /* ignore */
    }
  }
  return found.sort()
}

async function localCommitDays(repos) {
  const seen = new Set()
  const byDay = new Map()
  const report = []
  for (const repo of repos) {
    try {
      const { stdout } = await exec('git', ['-C', repo, 'log', '--all', '--pretty=format:%H|%ad', '--date=short'], {
        maxBuffer: 32 * 1024 * 1024,
        windowsHide: true
      })
      let fresh = 0
      for (const line of stdout.split(/\r?\n/)) {
        const [sha, day] = line.split('|')
        if (!sha || !day || seen.has(sha)) continue
        seen.add(sha)
        fresh += 1
        byDay.set(day, (byDay.get(day) || 0) + 1)
      }
      report.push({ repo: repo.replace(/\\/g, '/'), commits: fresh })
    } catch {
      report.push({ repo: repo.replace(/\\/g, '/'), commits: null })
    }
  }
  return { byDay, report }
}

/* ---------- 4. build one switchable window ---------- */

function buildWindow({ key, label, hint, from, to, counts, offGithub, accountTotals }) {
  const dates = eachDay(from, to)
  const entries = []

  for (const date of dates) {
    const count = counts.get(date) || 0
    if (count > 0) {
      entries.push({ date, weekday: weekdayOf(date), count })
      continue
    }
    const note = offGithub.get(date)
    if (note) entries.push({ date, weekday: weekdayOf(date), count: 0, offGithub: true, note })
  }

  // Levels are quantiles of this window's own active days, so a quiet year
  // still shows contrast instead of a single flat colour.
  const activeCounts = entries.filter((e) => e.count > 0).map((e) => e.count).sort((a, b) => a - b)
  let t1 = 1
  let t2 = 1
  let t3 = 1
  if (activeCounts.length) {
    const q = (p) => activeCounts[Math.min(activeCounts.length - 1, Math.floor(activeCounts.length * p))]
    t1 = Math.max(1, q(0.25))
    t2 = Math.max(t1, q(0.5))
    t3 = Math.max(t2, q(0.75))
  }
  for (const entry of entries) {
    let level = 0
    if (entry.count > 0 && entry.count >= t3) level = 4
    else if (entry.count > 0 && entry.count >= t2) level = 3
    else if (entry.count > 0 && entry.count >= t1) level = 2
    else if (entry.count > 0) level = 1
    entry.level = level
  }

  const total = entries.reduce((sum, e) => sum + e.count, 0)
  const withWork = entries.filter((e) => e.count > 0)
  const offDays = entries.filter((e) => e.offGithub)
  const best = withWork.slice().sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))[0]

  // Month labels keyed to the week column they start in.
  const months = []
  let previous = ''
  for (const date of dates) {
    const mk = date.slice(0, 7)
    if (mk === previous) continue
    previous = mk
    const offset = dates.indexOf(date)
    months.push({
      label: new Date(date + 'T00:00:00Z').toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      year: date.slice(0, 4),
      column: Math.floor((offset + weekdayOf(dates[0])) / 7)
    })
  }

  return {
    key,
    label,
    hint,
    windowStart: from,
    windowEnd: to,
    total,
    activeDays: withWork.length,
    offGithubDays: offDays.length,
    emptyDays: dates.length - withWork.length,
    bestDay: best ? { date: best.date, count: best.count } : { date: from, count: 0 },
    accounts: accountTotals,
    months,
    active: entries
  }
}

/* ---------- 5. main ---------- */

async function main() {
  const fetched = await Promise.all(ACCOUNTS.map((acc) => fetchAccount(acc.login)))
  const snapshot = await readSnapshot()

  const repos = await findRepos([
    'D:/QwerNFC',
    'D:/Nexora',
    'D:/.PORTFOLIO/portfolio',
    'D:/.PORTFOLIO/.PORTFOLIO/portfolio'
  ])
  const { byDay: localDays, report } = await localCommitDays(repos)

  // Days with local commits that GitHub never saw.
  const offGithub = new Map()
  for (const [date, commits] of localDays) {
    const onGitHub = fetched.reduce((sum, acc) => sum + (acc.map.get(date) || 0), 0)
    if (onGitHub > 0) continue
    offGithub.set(date, `${commits} local commit${commits === 1 ? '' : 's'} in your own repositories, not pushed to GitHub`)
  }

  if (snapshot) for (const [date, note] of snapshot.notes) offGithub.set(date, note)

  // One combined day map for every year Mark has ever worked: both accounts
  // added together, with the official snapshot winning wherever it has a
  // verdict (its numbers are the ones the published site already shows).
  const counts = new Map()
  for (const acc of fetched) {
    for (const [date, count] of acc.map) counts.set(date, (counts.get(date) || 0) + count)
  }
  if (snapshot) {
    for (const [date, count] of snapshot.dayMap) {
      if (date < snapshot.from || date > snapshot.to) continue
      counts.set(date, count)
    }
  }

  // Per-account totals: official total inside its window, calendar count
  // outside it, so the two never count the same day twice.
  const accountTotals = fetched.map((acc) => {
    const label = ACCOUNTS.find((item) => item.login === acc.login).label
    let outside = 0
    for (const [date, count] of acc.map) {
      if (snapshot && date >= snapshot.from && date <= snapshot.to) continue
      outside += count
    }
    const inside = snapshot
      ? Number(snapshot.accounts.find((item) => item.login === acc.login)?.total || 0)
      : 0
    return { login: acc.login, label, total: inside + outside }
  })

  // The grid runs from the very first active day to today: no blank on the
  // left, only the days still ahead sit to the right.
  const activeDates = [...counts.entries()].filter(([, n]) => n > 0).map(([date]) => date)
  const allDates = activeDates.concat([...offGithub.keys()])
  const first = allDates.length ? allDates.slice().sort()[0] : toISO(new Date())
  const today = toISO(new Date())

  const windows = [
    buildWindow({
      key: 'all',
      label: 'All time',
      hint: 'every year from first to latest commit, both accounts',
      from: first,
      to: today,
      counts,
      offGithub,
      accountTotals
    })
  ]

  const file = [
    '/**',
    ' * GENERATED by tools/build-contributions-years.mjs — do not edit by hand.',
    ' *',
    ' * One entry per switchable window: the official 12-month GitHub window the',
    ' * site already published, plus calendar years from the public calendars.',
    ' * `active` holds only days with work (or a recorded off-GitHub note); the card',
    ' * expands those into the full grid, so long empty stretches cost nothing here.',
    ' * A day marked offGithub is a day you committed locally but GitHub never saw.',
    ' */',
    '',
    'export const CONTRIBUTION_WINDOWS = ' + JSON.stringify(windows, null, 2),
    '',
    'export const CONTRIBUTION_META = ' +
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          weekdayLabels: WEEKDAYS,
          accounts: ACCOUNTS,
          source: 'GitHub public contribution calendars + local git history'
        },
        null,
        2
      ),
    '',
    'export default CONTRIBUTION_WINDOWS',
    ''
  ].join('\n')

  await writeFile(OUT, file, 'utf8')

  console.log('Wrote ' + OUT)
  console.log('Repos scanned: ' + report.filter((r) => r.commits).length + ' with history')
  console.log('Local commit days never on GitHub: ' + [...offGithub.keys()].filter((d) => localDays.has(d)).length)
  for (const w of windows) {
    console.log(
      `${w.key.padEnd(7)} ${w.windowStart} → ${w.windowEnd} | total ${w.total} | active ${w.activeDays} | off-GitHub ${w.offGithubDays} | best ${w.bestDay.count} on ${w.bestDay.date}`
    )
  }
}

main().catch((error) => {
  console.error('Failed: ' + error.message)
  process.exitCode = 1
})
