import {
  STATUS_KEY,
  getPublicSnapshot,
  refreshContributions
} from './contributions.mjs'

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      ...extraHeaders
    }
  })
}

async function sha256Bytes(value) {
  const encoded = new TextEncoder().encode(String(value))
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return new Uint8Array(digest)
}

async function hasValidRefreshSecret(request, env) {
  const expected = env?.MANUAL_REFRESH_SECRET
  if (!expected || !String(expected).trim()) return false

  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return false
  const provided = header.slice(7).trim()
  if (!provided) return false

  const [a, b] = await Promise.all([sha256Bytes(provided), sha256Bytes(expected)])
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(a, b)
  }
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/contributions' && request.method === 'GET') {
      const { snapshot, source } = await getPublicSnapshot(env)
      return jsonResponse(snapshot, 200, {
        'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'x-contributions-source': source
      })
    }

    if (url.pathname === '/api/contributions/status' && request.method === 'GET') {
      let status = { status: 'uninitialized' }
      if (env?.CONTRIBUTIONS_KV && typeof env.CONTRIBUTIONS_KV.get === 'function') {
        try {
          const stored = await env.CONTRIBUTIONS_KV.get(STATUS_KEY, { type: 'json' })
          if (stored) status = stored
        } catch {
          status = { status: 'status-read-error' }
        }
      }
      return jsonResponse(status, 200, {
        'cache-control': 'no-store'
      })
    }

    if (url.pathname === '/api/contributions/refresh' && request.method === 'POST') {
      if (!env?.MANUAL_REFRESH_SECRET || !String(env.MANUAL_REFRESH_SECRET).trim()) {
        return jsonResponse({ error: 'Not found' }, 404, { 'cache-control': 'no-store' })
      }
      if (!(await hasValidRefreshSecret(request, env))) {
        return jsonResponse({ error: 'Unauthorized' }, 401, { 'cache-control': 'no-store' })
      }
      const result = await refreshContributions(env)
      return jsonResponse(
        result.ok
          ? { ok: true, status: result.status }
          : { ok: false, error: result.error, status: result.status },
        result.ok ? 200 : 502,
        { 'cache-control': 'no-store' }
      )
    }

    if (env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request)
    }

    return new Response('Not found', { status: 404 })
  },

  async scheduled(controller, env, ctx) {
    const task = refreshContributions(env).then((result) => {
      if (result.ok) {
        console.info('[contributions] scheduled refresh ok', {
          cron: controller?.cron || 'manual',
          totalContributions: result.status.totalContributions,
          refreshedAt: result.status.lastSuccessfulRefresh
        })
      } else {
        console.error('[contributions] scheduled refresh failed (last known good snapshot preserved)', {
          cron: controller?.cron || 'manual',
          errorCode: result.error.code,
          errorMessage: result.error.message
        })
      }
    })

    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(task)
    } else {
      await task
    }
  }
}
