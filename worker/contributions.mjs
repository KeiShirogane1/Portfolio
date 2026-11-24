import { MANUAL_OFF_GITHUB_NOTES } from '../src/data/off-github-notes.js'
import { CONTRIBUTION_WINDOWS, CONTRIBUTION_META } from '../src/data/contributions-years.js'

export const SNAPSHOT_KEY = 'contributions:snapshot:v1'
export const STATUS_KEY = 'contributions:status:v1'
export const SCHEMA_VERSION = 1
export const TIMEZONE = 'Asia/Manila'
export const GRAPHQL_URL = 'https://api.github.com/graphql'

export const ACCOUNTS = [
  { login: 'KeiShirogane1', label: 'Main', secretName: 'KEI_READ_USER_TOKEN' },
  { login: 'TheNFCGuy', label: 'QwerNFC', secretName: 'QWERNFC_READ_USER_TOKEN' }
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MS = 86400000

const YEARS_QUERY = `
query ContributionYears($login: String!) {
  user(login: $login) {
    login
    contributionsCollection {
      contributionYears
    }
  }
}`

const CALENDAR_QUERY = `
query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    contributionsCollection(from: $from, to: $to) {
      hasAnyRestrictedContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

function weekdayOf(iso) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay()
}

function eachDay(from, to) {
  const days = []
  for (let d = new Date(`${from}T00:00:00Z`); toISO(d) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(toISO(d))
  }
  return days
}

function sanitizeError(error) {
  const code = String(error?.code || 'REFRESH_ERROR')
  const raw = String(error?.message || 'Contribution refresh failed')
  // Never echo bearer tokens or long auth strings into KV status or logs.
  const message = raw
    .replace(/gh[pousr]_[A-Za-z0-9_]+/g, '[redacted-token]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .slice(0, 240)
  return { code, message }
}

async function graphqlRequest({ token, query, variables, fetchImpl }) {
  let response
  try {
    response = await fetchImpl(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'keishirogane-portfolio-worker'
      },
      body: JSON.stringify({ query, variables })
    })
  } catch (err) {
    const error = new Error(`Network request to GitHub GraphQL failed: ${err?.message || 'unknown'}`)
    error.code = 'GITHUB_NETWORK_ERROR'
    throw error
  }

  if (response.status === 401 || response.status === 403) {
    const remaining = response.headers?.get?.('x-ratelimit-remaining')
    const error = new Error(
      remaining === '0'
        ? `GitHub API rate limit exceeded (HTTP ${response.status})`
        : `GitHub token unauthorized or expired (HTTP ${response.status})`
    )
    error.code = remaining === '0' ? 'GITHUB_RATE_LIMIT' : 'GITHUB_AUTH_ERROR'
    throw error
  }

  if (response.status === 429) {
    const error = new Error('GitHub API rate limit exceeded (HTTP 429)')
    error.code = 'GITHUB_RATE_LIMIT'
    throw error
  }

  if (!response.ok) {
    const error = new Error(`GitHub GraphQL HTTP ${response.status}`)
    error.code = 'GITHUB_HTTP_ERROR'
    throw error
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    const error = new Error('GitHub GraphQL returned invalid JSON')
    error.code = 'GITHUB_INVALID_JSON'
    throw error
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstMsg = String(payload.errors[0]?.message || 'GraphQL query error')
    const error = new Error(`GitHub GraphQL error: ${firstMsg}`)
    error.code = 'GITHUB_GRAPHQL_ERROR'
    throw error
  }

  return payload?.data
}

/**
 * Fetch all contribution years and daily counts for one GitHub account.
 */
export async function fetchAccountAllYears({ login, token, fetchImpl = globalThis.fetch, now = new Date() }) {
  if (!token || !String(token).trim()) {
    const error = new Error(`Missing GitHub token for ${login}`)
    error.code = 'MISSING_TOKEN'
    throw error
  }

  const yearsData = await graphqlRequest({
    token,
    query: YEARS_QUERY,
    variables: { login },
    fetchImpl
  })

  const years = yearsData?.user?.contributionsCollection?.contributionYears
  if (!yearsData?.user || !Array.isArray(years) || years.length === 0) {
    const error = new Error(`Missing contributionYears for account ${login}`)
    error.code = 'MISSING_ACCOUNT_DATA'
    throw error
  }

  const currentYear = now.getUTCFullYear()
  const nowIso = now.toISOString()
  const sortedYears = [...new Set(years.map(Number).filter((y) => Number.isInteger(y) && y >= 2008))].sort((a, b) => a - b)

  const daily = new Map()
  const yearlyTotals = {}
  let restrictedContributionsCount = 0
  let privateContributionCountsShared = false

  for (const year of sortedYears) {
    const from = `${year}-01-01T00:00:00Z`
    const to = year === currentYear ? nowIso : `${year}-12-31T23:59:59Z`

    const calData = await graphqlRequest({
      token,
      query: CALENDAR_QUERY,
      variables: { login, from, to },
      fetchImpl
    })

    const collection = calData?.user?.contributionsCollection
    const calendar = collection?.contributionCalendar
    if (!collection || !calendar || !Array.isArray(calendar.weeks)) {
      const error = new Error(`Missing contributionCalendar for ${login} (${year})`)
      error.code = 'MISSING_CALENDAR_DATA'
      throw error
    }

    if (collection.hasAnyRestrictedContributions) {
      privateContributionCountsShared = true
    }
    restrictedContributionsCount += Number(collection.restrictedContributionsCount || 0)

    let yearSum = 0
    for (const week of calendar.weeks) {
      if (!Array.isArray(week?.contributionDays)) continue
      for (const day of week.contributionDays) {
        if (!day?.date) continue
        const count = Math.max(0, Number(day.contributionCount) || 0)
        daily.set(day.date, count)
        yearSum += count
      }
    }

    // Prefer sum of daily counts if GitHub total differs slightly, or fall back to calendar total.
    yearlyTotals[String(year)] = yearSum || Number(calendar.totalContributions) || 0
  }

  return {
    login,
    daily,
    yearlyTotals,
    total: [...daily.values()].reduce((sum, n) => sum + n, 0),
    restrictedContributionsCount,
    privateContributionCountsShared
  }
}

/**
 * Combine account calendars, preserve prior history if needed, apply off-GitHub
 * notes, compute quantile intensity levels, and emit a schema-compatible snapshot.
 */
export function buildContributionSnapshot({
  accountResults,
  offGithubNotes = MANUAL_OFF_GITHUB_NOTES,
  previousSnapshot = null,
  now = new Date()
}) {
  const refreshedAt = now.toISOString()
  const today = toISO(now)

  // Preserve historical days from previousSnapshot if an account omitted an old year,
  // while letting freshly fetched GraphQL data overwrite every fetched date.
  const combinedCounts = new Map()
  const prevDays = previousSnapshot?.windows?.[0]?.active
  const fetchedDates = new Set()
  for (const acc of accountResults) {
    for (const date of acc.daily.keys()) fetchedDates.add(date)
  }
  if (Array.isArray(prevDays)) {
    for (const entry of prevDays) {
      if (entry?.date && !entry.offGithub && entry.count > 0 && !fetchedDates.has(entry.date)) {
        combinedCounts.set(entry.date, Number(entry.count) || 0)
      }
    }
  }

  for (const acc of accountResults) {
    for (const [date, count] of acc.daily) {
      if (count > 0) {
        combinedCounts.set(date, (combinedCounts.get(date) || 0) + count)
      }
    }
  }

  // Merge off-GitHub notes, skipping any date that already has GitHub contributions.
  const offGithub = new Map()
  for (const item of offGithubNotes || []) {
    if (!item?.date) continue
    if ((combinedCounts.get(item.date) || 0) > 0) continue
    offGithub.set(item.date, item.note || 'Off-GitHub development activity')
  }

  const activeDates = [...combinedCounts.entries()].filter(([, n]) => n > 0).map(([date]) => date)
  const allDates = activeDates.concat([...offGithub.keys()])
  const windowStart = allDates.length ? allDates.slice().sort()[0] : today
  const windowEnd = today

  const dates = eachDay(windowStart, windowEnd)
  const entries = []
  for (const date of dates) {
    const count = combinedCounts.get(date) || 0
    if (count > 0) {
      entries.push({ date, weekday: weekdayOf(date), count })
      continue
    }
    const note = offGithub.get(date)
    if (note) {
      entries.push({ date, weekday: weekdayOf(date), count: 0, offGithub: true, note })
    }
  }

  // Quantile intensity levels (0..4) matching build-contributions-years.mjs.
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

  const totalContributions = entries.reduce((sum, e) => sum + e.count, 0)
  const withWork = entries.filter((e) => e.count > 0)
  const offDays = entries.filter((e) => e.offGithub)
  const best = withWork.slice().sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))[0]

  const yearlyTotals = {}
  for (const entry of withWork) {
    const year = entry.date.slice(0, 4)
    yearlyTotals[year] = (yearlyTotals[year] || 0) + entry.count
  }

  const months = []
  let previousMonth = ''
  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i]
    const mk = date.slice(0, 7)
    if (mk === previousMonth) continue
    previousMonth = mk
    months.push({
      label: new Date(`${date}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      year: date.slice(0, 4),
      column: Math.floor((i + weekdayOf(dates[0])) / 7)
    })
  }

  const accountSummaries = ACCOUNTS.map((meta) => {
    const found = accountResults.find((r) => r.login === meta.login)
    return {
      login: meta.login,
      label: meta.label,
      total: found ? found.total : 0,
      privateContributionCountsShared: Boolean(found?.privateContributionCountsShared)
    }
  })

  const accountCalendars = {}
  for (const acc of accountResults) {
    accountCalendars[acc.login] = {
      total: acc.total,
      yearlyTotals: acc.yearlyTotals,
      privateContributionCountsShared: acc.privateContributionCountsShared
    }
  }

  const windowObj = {
    key: 'all',
    label: 'All time',
    hint: 'every year from first to latest commit, both accounts',
    windowStart,
    windowEnd,
    total: totalContributions,
    activeDays: withWork.length,
    offGithubDays: offDays.length,
    emptyDays: dates.length - withWork.length,
    bestDay: best ? { date: best.date, count: best.count } : { date: windowStart, count: 0 },
    accounts: accountSummaries.map(({ login, label, total }) => ({ login, label, total })),
    months,
    active: entries
  }

  const meta = {
    generatedAt: refreshedAt,
    lastSuccessfulRefresh: refreshedAt,
    weekdayLabels: WEEKDAYS,
    accounts: ACCOUNTS.map(({ login, label }) => ({ login, label })),
    source: 'GitHub GraphQL API (Cloudflare Cron) + local off-GitHub notes'
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    refreshedAt,
    lastSuccessfulRefresh: refreshedAt,
    timezone: TIMEZONE,
    sourceAccounts: accountSummaries,
    accountCalendars,
    combinedCalendar: entries,
    yearlyTotals,
    totalContributions,
    windows: [windowObj],
    meta
  }
}

/**
 * Wrap the build-time bundled data as a compatible fallback snapshot when KV is
 * empty (e.g. first deploy before the first Cron run).
 */
export function getBundledFallbackSnapshot() {
  const firstWindow = CONTRIBUTION_WINDOWS[0]
  const yearlyTotals = {}
  for (const entry of firstWindow?.active || []) {
    if (entry.count > 0) {
      const y = entry.date.slice(0, 4)
      yearlyTotals[y] = (yearlyTotals[y] || 0) + entry.count
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    refreshedAt: CONTRIBUTION_META.generatedAt,
    lastSuccessfulRefresh: CONTRIBUTION_META.generatedAt,
    timezone: TIMEZONE,
    sourceAccounts: firstWindow?.accounts || CONTRIBUTION_META.accounts,
    yearlyTotals,
    totalContributions: firstWindow?.total || 0,
    windows: CONTRIBUTION_WINDOWS,
    meta: {
      ...CONTRIBUTION_META,
      lastSuccessfulRefresh: CONTRIBUTION_META.generatedAt
    }
  }
}

/**
 * Read the public snapshot from KV, or return the bundled fallback.
 */
export async function getPublicSnapshot(env) {
  const kv = env?.CONTRIBUTIONS_KV
  if (kv && typeof kv.get === 'function') {
    try {
      const stored = await kv.get(SNAPSHOT_KEY, { type: 'json' })
      if (
        stored &&
        Array.isArray(stored.windows) &&
        stored.windows[0]?.active?.length > 0 &&
        stored.windows[0].total > 0
      ) {
        return { snapshot: stored, source: 'kv' }
      }
    } catch {
      // Fall through to bundled fallback.
    }
  }
  return { snapshot: getBundledFallbackSnapshot(), source: 'bundled-fallback' }
}

/**
 * Execute a scheduled/manual refresh, preserving the last known good snapshot on
 * any error and recording sanitized operational status separately.
 */
export async function refreshContributions(env, { fetchImpl = globalThis.fetch, now = new Date() } = {}) {
  const attemptAt = now.toISOString()
  const kv = env?.CONTRIBUTIONS_KV

  let previousSnapshot = null
  let previousStatus = null
  if (kv && typeof kv.get === 'function') {
    try {
      previousSnapshot = await kv.get(SNAPSHOT_KEY, { type: 'json' })
    } catch {
      previousSnapshot = null
    }
    try {
      previousStatus = await kv.get(STATUS_KEY, { type: 'json' })
    } catch {
      previousStatus = null
    }
  }

  const lastKnownSuccess =
    previousStatus?.lastSuccessfulRefresh ||
    previousSnapshot?.lastSuccessfulRefresh ||
    CONTRIBUTION_META.generatedAt

  try {
    if (!kv || typeof kv.put !== 'function') {
      const error = new Error('CONTRIBUTIONS_KV binding is not configured')
      error.code = 'MISSING_KV_BINDING'
      throw error
    }

    const accountResults = []
    for (const acc of ACCOUNTS) {
      const token = env?.[acc.secretName]
      const result = await fetchAccountAllYears({
        login: acc.login,
        token,
        fetchImpl,
        now
      })
      accountResults.push(result)
    }

    const snapshot = buildContributionSnapshot({
      accountResults,
      offGithubNotes: MANUAL_OFF_GITHUB_NOTES,
      previousSnapshot,
      now
    })

    if (!snapshot.totalContributions || snapshot.totalContributions <= 0) {
      const error = new Error('Refusing to overwrite snapshot with empty contribution total')
      error.code = 'EMPTY_SNAPSHOT_GUARD'
      throw error
    }

    try {
      await kv.put(SNAPSHOT_KEY, JSON.stringify(snapshot))
    } catch (kvErr) {
      const error = new Error(`Failed writing snapshot to CONTRIBUTIONS_KV: ${kvErr?.message || 'unknown'}`)
      error.code = 'KV_WRITE_ERROR'
      throw error
    }

    const okStatus = {
      schemaVersion: SCHEMA_VERSION,
      status: 'ok',
      timezone: TIMEZONE,
      lastAttemptAt: attemptAt,
      lastSuccessfulRefresh: snapshot.lastSuccessfulRefresh,
      totalContributions: snapshot.totalContributions,
      sourceAccounts: snapshot.sourceAccounts
    }

    try {
      await kv.put(STATUS_KEY, JSON.stringify(okStatus))
    } catch {
      // Snapshot already succeeded; ignore non-fatal status write error.
    }

    return { ok: true, snapshot, status: okStatus }
  } catch (err) {
    const clean = sanitizeError(err)
    const errStatus = {
      schemaVersion: SCHEMA_VERSION,
      status: 'error',
      timezone: TIMEZONE,
      lastAttemptAt: attemptAt,
      lastSuccessfulRefresh: lastKnownSuccess,
      errorCode: clean.code,
      errorMessage: clean.message
    }

    if (kv && typeof kv.put === 'function') {
      try {
        await kv.put(STATUS_KEY, JSON.stringify(errStatus))
      } catch {
        // Best-effort status write; never wipe SNAPSHOT_KEY.
      }
    }

    return { ok: false, error: clean, status: errStatus }
  }
}
