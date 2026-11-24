import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker/index.mjs'
import {
  SNAPSHOT_KEY,
  STATUS_KEY,
  getPublicSnapshot,
  refreshContributions
} from '../worker/contributions.mjs'

function createMemoryKV(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    store,
    async get(key, opts) {
      if (!store.has(key)) return null
      const raw = store.get(key)
      return opts?.type === 'json' ? JSON.parse(raw) : raw
    },
    async put(key, value) {
      store.set(key, String(value))
    }
  }
}

function makeGraphqlFetch(fixtures) {
  return async (url, init) => {
    const body = JSON.parse(init.body)
    const { login, from } = body.variables || {}
    const auth = init.headers?.authorization || ''

    if (auth.includes('INVALID_TOKEN')) {
      return new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 })
    }
    if (auth.includes('RATE_LIMITED')) {
      return new Response(JSON.stringify({ message: 'API rate limit exceeded' }), {
        status: 403,
        headers: { 'x-ratelimit-remaining': '0' }
      })
    }

    const account = fixtures[login]
    if (!account) {
      return new Response(JSON.stringify({ errors: [{ message: `Could not resolve to a User with the login of '${login}'.` }] }), {
        status: 200
      })
    }

    if (!from) {
      return new Response(
        JSON.stringify({
          data: {
            user: {
              login,
              contributionsCollection: {
                contributionYears: Object.keys(account.years).map(Number)
              }
            }
          }
        }),
        { status: 200 }
      )
    }

    const year = from.slice(0, 4)
    const days = account.years[year] || []
    const total = days.reduce((s, d) => s + d.contributionCount, 0)
    return new Response(
      JSON.stringify({
        data: {
          user: {
            login,
            contributionsCollection: {
              hasAnyRestrictedContributions: Boolean(account.privateShared),
              restrictedContributionsCount: account.privateCount || 0,
              contributionCalendar: {
                totalContributions: total,
                weeks: [{ contributionDays: days }]
              }
            }
          }
        }
      }),
      { status: 200 }
    )
  }
}

const SAMPLE_FIXTURES = {
  KeiShirogane1: {
    privateShared: true,
    privateCount: 2,
    years: {
      2025: [{ date: '2025-12-31', contributionCount: 4 }],
      2026: [
        { date: '2026-11-22', contributionCount: 5 },
        { date: '2026-11-23', contributionCount: 10 }
      ]
    }
  },
  TheNFCGuy: {
    privateShared: false,
    years: {
      2026: [
        { date: '2026-11-22', contributionCount: 3 },
        { date: '2026-11-23', contributionCount: 2 }
      ]
    }
  }
}

test('refreshContributions fetches both accounts, merges daily counts, preserves off-GitHub notes, and writes KV', async () => {
  const kv = createMemoryKV()
  const env = {
    CONTRIBUTIONS_KV: kv,
    KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
    QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
  }

  const result = await refreshContributions(env, {
    fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
    now: new Date('2026-11-23T16:01:00Z')
  })

  assert.equal(result.ok, true)
  assert.equal(result.snapshot.schemaVersion, 1)
  assert.equal(result.snapshot.timezone, 'Asia/Manila')
  assert.equal(result.snapshot.totalContributions, 24)
  assert.deepEqual(result.snapshot.yearlyTotals, { 2025: 4, 2026: 20 })

  const win = result.snapshot.windows[0]
  assert.equal(win.total, 24)
  assert.equal(win.accounts.find((a) => a.login === 'KeiShirogane1').total, 19)
  assert.equal(win.accounts.find((a) => a.login === 'TheNFCGuy').total, 5)
  assert.equal(win.offGithubDays, 7)

  const nov22 = win.active.find((d) => d.date === '2026-11-22')
  assert.equal(nov22.count, 8)
  const nov02 = win.active.find((d) => d.date === '2026-11-02')
  assert.equal(nov02.offGithub, true)
  assert.equal(nov02.count, 0)

  const pub = await getPublicSnapshot(env)
  assert.equal(pub.source, 'kv')
  assert.equal(pub.snapshot.totalContributions, 24)
})

test('invalid GitHub token does not overwrite last known good KV snapshot and never leaks secret in status', async () => {
  const kv = createMemoryKV()
  const goodEnv = {
    CONTRIBUTIONS_KV: kv,
    KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
    QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
  }
  const first = await refreshContributions(goodEnv, {
    fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
    now: new Date('2026-11-23T16:01:00Z')
  })
  assert.equal(first.ok, true)

  const badEnv = {
    CONTRIBUTIONS_KV: kv,
    KEI_READ_USER_TOKEN: 'ghp_INVALID_TOKEN_SHOULD_NOT_LEAK',
    QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
  }
  const failed = await refreshContributions(badEnv, {
    fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
    now: new Date('2026-11-24T16:01:00Z')
  })

  assert.equal(failed.ok, false)
  assert.equal(failed.error.code, 'GITHUB_AUTH_ERROR')
  assert.equal(failed.status.lastSuccessfulRefresh, '2026-11-23T16:01:00.000Z')
  assert.equal(JSON.stringify(failed.status).includes('INVALID_TOKEN'), false)

  // Verify last known good snapshot in KV is completely intact.
  const pub = await getPublicSnapshot(badEnv)
  assert.equal(pub.source, 'kv')
  assert.equal(pub.snapshot.totalContributions, 24)
  assert.equal(pub.snapshot.lastSuccessfulRefresh, '2026-11-23T16:01:00.000Z')
})

test('worker fetch serves /api/contributions, /api/contributions/status, and delegates static assets', async () => {
  const kv = createMemoryKV()
  const env = {
    CONTRIBUTIONS_KV: kv,
    ASSETS: {
      async fetch(req) {
        return new Response(`asset:${new URL(req.url).pathname}`, { status: 200 })
      }
    }
  }

  const apiRes = await worker.fetch(new Request('https://example.com/api/contributions'), env)
  assert.equal(apiRes.status, 200)
  assert.equal(apiRes.headers.get('x-contributions-source'), 'bundled-fallback')
  const apiJson = await apiRes.json()
  assert.ok(apiJson.totalContributions > 0)
  assert.ok(apiJson.windows[0].offGithubDays >= 7)

  const staticRes = await worker.fetch(new Request('https://example.com/'), env)
  assert.equal(staticRes.status, 200)
  assert.equal(await staticRes.text(), 'asset:/')
})

test('KV read and write failures fall back safely without crashing', async () => {
  const failingKV = {
    async get() {
      throw new Error('KV read unavailable')
    },
    async put() {
      throw new Error('KV write quota exceeded')
    }
  }
  const env = {
    CONTRIBUTIONS_KV: failingKV,
    KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
    QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
  }

  const apiRes = await worker.fetch(new Request('https://example.com/api/contributions'), env)
  assert.equal(apiRes.status, 200)
  assert.equal(apiRes.headers.get('x-contributions-source'), 'bundled-fallback')
  const apiJson = await apiRes.json()
  assert.ok(apiJson.totalContributions > 0)

  const statusRes = await worker.fetch(new Request('https://example.com/api/contributions/status'), env)
  assert.equal(statusRes.status, 200)
  assert.deepEqual(await statusRes.json(), { status: 'status-read-error' })

  const refreshResult = await refreshContributions(env, {
    fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
    now: new Date('2026-11-23T16:01:00Z')
  })
  assert.equal(refreshResult.ok, false)
  assert.equal(refreshResult.error.code, 'KV_WRITE_ERROR')
})

test('GitHub rate limits and GraphQL errors preserve last known good KV snapshot', async () => {
  const kv = createMemoryKV()
  const goodEnv = {
    CONTRIBUTIONS_KV: kv,
    KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
    QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
  }
  const initial = await refreshContributions(goodEnv, {
    fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
    now: new Date('2026-11-23T16:01:00Z')
  })
  assert.equal(initial.ok, true)

  const rateLimited = await refreshContributions(
    {
      CONTRIBUTIONS_KV: kv,
      KEI_READ_USER_TOKEN: 'ghp_RATE_LIMITED_TOKEN',
      QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
    },
    {
      fetchImpl: makeGraphqlFetch(SAMPLE_FIXTURES),
      now: new Date('2026-11-24T16:01:00Z')
    }
  )
  assert.equal(rateLimited.ok, false)
  assert.equal(rateLimited.error.code, 'GITHUB_RATE_LIMIT')
  assert.equal(JSON.stringify(rateLimited.status).includes('RATE_LIMITED'), false)

  const graphqlError = await refreshContributions(
    {
      CONTRIBUTIONS_KV: kv,
      KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
      QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
    },
    {
      fetchImpl: makeGraphqlFetch({ KeiShirogane1: SAMPLE_FIXTURES.KeiShirogane1 }),
      now: new Date('2026-11-25T16:01:00Z')
    }
  )
  assert.equal(graphqlError.ok, false)
  assert.equal(graphqlError.error.code, 'GITHUB_GRAPHQL_ERROR')

  const pub = await getPublicSnapshot(goodEnv)
  assert.equal(pub.source, 'kv')
  assert.equal(pub.snapshot.totalContributions, 24)
  assert.equal(pub.snapshot.lastSuccessfulRefresh, '2026-11-23T16:01:00.000Z')
})

test('POST /api/contributions/refresh is 404 when unset, 401 on invalid auth, and 200 when authorized', async () => {
  const kv = createMemoryKV()
  const unsetRes = await worker.fetch(
    new Request('https://example.com/api/contributions/refresh', { method: 'POST' }),
    { CONTRIBUTIONS_KV: kv }
  )
  assert.equal(unsetRes.status, 404)

  const envWithSecret = {
    CONTRIBUTIONS_KV: kv,
    MANUAL_REFRESH_SECRET: 'ephemeral-test-secret'
  }
  const missingAuthRes = await worker.fetch(
    new Request('https://example.com/api/contributions/refresh', { method: 'POST' }),
    envWithSecret
  )
  assert.equal(missingAuthRes.status, 401)

  const wrongAuthRes = await worker.fetch(
    new Request('https://example.com/api/contributions/refresh', {
      method: 'POST',
      headers: { authorization: 'Bearer wrong-secret' }
    }),
    envWithSecret
  )
  assert.equal(wrongAuthRes.status, 401)

  const origFetch = globalThis.fetch
  globalThis.fetch = makeGraphqlFetch(SAMPLE_FIXTURES)
  try {
    const okRes = await worker.fetch(
      new Request('https://example.com/api/contributions/refresh', {
        method: 'POST',
        headers: { authorization: 'Bearer ephemeral-test-secret' }
      }),
      {
        ...envWithSecret,
        KEI_READ_USER_TOKEN: 'ghp_test_kei_secret_123',
        QWERNFC_READ_USER_TOKEN: 'ghp_test_nfc_secret_456'
      }
    )
    assert.equal(okRes.status, 200)
    const body = await okRes.json()
    assert.equal(body.ok, true)
    assert.equal(body.status.totalContributions, 24)
  } finally {
    globalThis.fetch = origFetch
  }
})
