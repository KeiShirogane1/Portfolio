import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Refresh the combined contribution calendar from GitHub's official GraphQL API.
 *
 * Required environment variable:
 *   KEI_READ_USER_TOKEN — a classic PAT created while signed in as KeiShirogane1.
 *   QWERNFC_READ_USER_TOKEN — a classic PAT created while signed in as TheNFCGuy.
 *
 * Private/internal contribution counts are included only when the token has
 * read:user and each target account has chosen to share private contribution
 * counts in its GitHub profile settings.
 */
const TOKENS = {
  KeiShirogane1: process.env.KEI_READ_USER_TOKEN,
  TheNFCGuy: process.env.QWERNFC_READ_USER_TOKEN
}
const ACCOUNTS = [
  { login: 'KeiShirogane1', label: 'Main' },
  { login: 'TheNFCGuy', label: 'QwerNFC' }
]
const GRAPHQL_URL = 'https://api.github.com/graphql'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'src', 'data', 'contributions.js')
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const QUERY = [
  'query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {',
  '  user(login: $login) {',
  '    login',
  '    contributionsCollection(from: $from, to: $to) {',
  '      hasAnyRestrictedContributions',
  '      restrictedContributionsCount',
  '      contributionCalendar {',
  '        totalContributions',
  '        weeks {',
  '          contributionDays { date contributionCount }',
  '        }',
  '      }',
  '    }',
  '  }',
  '}'
].join('\n')

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function dateRange() {
  const end = new Date()
  end.setUTCHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 364)
  return { start: isoDate(start), end: isoDate(end) }
}

async function fetchAccount(login, from, to) {
  const token = TOKENS[login]
  if (!token) throw new Error('Missing account token for ' + login)

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json',
      'user-agent': 'KeiShirogane1-Portfolio-Contribution-Refresh'
    },
    body: JSON.stringify({
      query: QUERY,
      variables: {
        login,
        from: from + 'T00:00:00Z',
        to: to + 'T23:59:59Z'
      }
    })
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(login + ': GitHub GraphQL HTTP ' + response.status)
  }
  if (!payload || (payload.errors && payload.errors.length)) {
    const details = payload && payload.errors
      ? payload.errors.map((error) => error.message).join('; ')
      : 'Invalid GraphQL response'
    throw new Error(login + ': ' + details)
  }

  const user = payload.data && payload.data.user
  if (!user || user.login.toLowerCase() !== login.toLowerCase()) {
    throw new Error('GitHub did not return the expected account: ' + login)
  }

  const collection = user.contributionsCollection
  const calendar = collection && collection.contributionCalendar
  if (!calendar || !Array.isArray(calendar.weeks)) {
    throw new Error(login + ': contribution calendar is missing')
  }

  const days = calendar.weeks
    .flatMap((week) => week.contributionDays || [])
    .filter((day) => day.date >= from && day.date <= to)
    .map((day) => ({
      date: day.date,
      count: Number(day.contributionCount) || 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const sum = days.reduce((total, day) => total + day.count, 0)
  const expected = Number(calendar.totalContributions)
  if (sum !== expected) {
    throw new Error(
      login + ': daily total (' + sum + ') does not match GitHub calendar total (' + expected + '); refusing to write incomplete data'
    )
  }

  return {
    login: user.login,
    total: expected,
    activeDays: days.filter((day) => day.count > 0).length,
    hasAnyRestrictedContributions: Boolean(collection.hasAnyRestrictedContributions),
    restrictedContributionsCount: Number(collection.restrictedContributionsCount) || 0,
    days
  }
}

function assignLevels(days) {
  const activeCounts = days
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b)

  if (!activeCounts.length) {
    return days.map((day) => ({ ...day, level: 0 }))
  }

  const quantile = (position) =>
    activeCounts[Math.min(activeCounts.length - 1, Math.floor(activeCounts.length * position))]
  const t1 = Math.max(1, quantile(0.25))
  const t2 = Math.max(t1, quantile(0.50))
  const t3 = Math.max(t2, quantile(0.75))

  return days.map((day) => {
    let level = 0
    if (day.count > 0 && day.count >= t3) level = 4
    else if (day.count > 0 && day.count >= t2) level = 3
    else if (day.count > 0 && day.count >= t1) level = 2
    else if (day.count > 0) level = 1
    return { ...day, level }
  })
}

function buildMonths(days) {
  const months = []
  let previous = ''
  days.forEach((day, index) => {
    const monthKey = day.date.slice(0, 7)
    if (monthKey !== previous) {
      const date = new Date(day.date + 'T00:00:00Z')
      const weekIndex = Math.floor((index + days[0].weekday) / 7)
      months.push({
        index: weekIndex * 7,
        label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
      })
      previous = monthKey
    }
  })
  return months
}

async function main() {
  const missingTokens = Object.entries(TOKENS).filter(([, token]) => !token).map(([login]) => login)
  if (missingTokens.length) {
    throw new Error(
      'Missing account token(s): ' + missingTokens.join(', ') + '. Add KEI_READ_USER_TOKEN and QWERNFC_READ_USER_TOKEN as repository Actions secrets. Each must be a classic PAT with read:user scope created by its matching account.'
    )
  }

  const window = dateRange()
  const accounts = await Promise.all(
    ACCOUNTS.map((account) => fetchAccount(account.login, window.start, window.end))
  )

  const merged = new Map()
  accounts.forEach((account) => {
    account.days.forEach((day) => {
      merged.set(day.date, (merged.get(day.date) || 0) + day.count)
    })
  })

  const startDate = new Date(window.start + 'T00:00:00Z')
  const dayCount = 365
  const rawDays = Array.from({ length: dayCount }, (_, offset) => {
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + offset)
    const key = isoDate(date)
    return {
      date: key,
      weekday: date.getUTCDay(),
      count: merged.get(key) || 0
    }
  })

  const days = assignLevels(rawDays)
  const total = days.reduce((sum, day) => sum + day.count, 0)
  const accountTotal = accounts.reduce((sum, account) => sum + account.total, 0)
  if (total !== accountTotal) {
    throw new Error('Merged daily total does not equal the sum of the two GitHub account totals')
  }

  const activeDays = days.filter((day) => day.count > 0).length
  const bestDay = days.reduce(
    (best, day) => (day.count > best.count ? day : best),
    { date: window.start, count: 0 }
  )
  const busiestDays = days
    .filter((day) => day.count > 0)
    .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))
    .slice(0, 5)
    .map(({ date, count }) => ({ date, count }))

  const accountSummary = accounts.map((account) => ({
    login: account.login,
    label: ACCOUNTS.find((item) => item.login === account.login).label,
    total: account.total,
    activeDays: account.activeDays,
    privateContributionCountsShared: account.hasAnyRestrictedContributions,
    restrictedContributionsCount: account.restrictedContributionsCount
  }))

  const output = {
    source: 'github-graphql',
    generatedAt: new Date().toISOString(),
    windowStart: window.start,
    windowEnd: window.end,
    total,
    activeDays,
    emptyDays: dayCount - activeDays,
    bestDay: { date: bestDay.date, count: bestDay.count },
    busiestDays,
    weekdayLabels: WEEKDAYS,
    months: buildMonths(rawDays),
    accounts: accountSummary,
    days
  }

  const file = [
    '/**',
    ' * GENERATED from GitHub official GraphQL contribution calendars.',
    ' * Refresh with: node tools/fetch-contributions.mjs',
    ' * Includes private/internal contribution counts only when GitHub returns',
    ' * them for the account (read:user token scope + profile sharing setting).',
    ' */',
    '',
    'export const GITHUB_ACCOUNTS = ' + JSON.stringify(accountSummary, null, 2),
    '',
    'export const GITHUB_USER = "KeiShirogane1"',
    '',
    'export const contributions = ' + JSON.stringify(output, null, 2),
    '',
    'export default contributions',
    ''
  ].join('\n')

  await writeFile(OUT, file, 'utf8')
  console.log('Wrote ' + OUT)
  console.log('Source: GitHub GraphQL')
  console.log('Window: ' + window.start + ' through ' + window.end)
  accountSummary.forEach((account) => {
    console.log(
      account.login + ': ' + account.total + ' contributions, ' +
      account.activeDays + ' active days, restricted count shared: ' +
      (account.privateContributionCountsShared ? 'yes' : 'not reported')
    )
  })
  console.log('Combined: ' + total + ' contributions across ' + activeDays + ' active days')
}

main().catch((error) => {
  console.error('Contribution refresh failed: ' + error.message)
  process.exitCode = 1
})
