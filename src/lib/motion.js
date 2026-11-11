/**
 * Shared motion layer.
 *
 * One pointer listener and one scroll listener for the whole site: components
 * subscribe instead of each installing their own. Everything is rAF-throttled,
 * so a hundred tilt cards still cost one frame of work per pointer move.
 */

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const lerp = (a, b, t) => a + (b - a) * t

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/* ---------------- pointer store ---------------- */

const pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false, inside: false }
const pointerSubs = new Set()
let pointerFrame = 0
let pointerBound = false

function flushPointer() {
  pointerFrame = 0
  pointerSubs.forEach((fn) => fn(pointer))
}

function schedulePointer() {
  if (pointerFrame) return
  pointerFrame = window.requestAnimationFrame(flushPointer)
}

function readPointer(event) {
  pointer.x = event.clientX
  pointer.y = event.clientY
  pointer.nx = (event.clientX / window.innerWidth) * 2 - 1
  pointer.ny = (event.clientY / window.innerHeight) * 2 - 1
  pointer.active = true
  pointer.inside = true
  schedulePointer()
}

function bindPointer() {
  if (pointerBound || typeof window === 'undefined') return
  pointerBound = true
  window.addEventListener('pointermove', readPointer, { passive: true })
  window.addEventListener('pointerdown', readPointer, { passive: true })
  window.addEventListener('pointerleave', () => {
    pointer.active = false
    pointer.inside = false
    schedulePointer()
  })
  window.addEventListener('blur', () => {
    pointer.inside = false
    schedulePointer()
  })
}

/** Subscribe to the throttled global pointer. Returns an unsubscribe function. */
export function subscribePointer(fn) {
  bindPointer()
  pointerSubs.add(fn)
  fn(pointer)
  return () => pointerSubs.delete(fn)
}

/* ---------------- scroll store ---------------- */

const scroll = { y: 0, progress: 0, max: 1, vh: 0, down: true }
const scrollSubs = new Set()
let scrollFrame = 0
let scrollBound = false

function flushScroll() {
  scrollFrame = 0
  scrollSubs.forEach((fn) => fn(scroll))
}

function readScroll() {
  const y = window.scrollY || 0
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  scroll.down = y >= scroll.y
  scroll.y = y
  scroll.max = max
  scroll.vh = window.innerHeight
  scroll.progress = clamp(y / max)
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(flushScroll)
}

function bindScroll() {
  if (scrollBound || typeof window === 'undefined') return
  scrollBound = true
  window.addEventListener('scroll', readScroll, { passive: true })
  window.addEventListener('resize', readScroll, { passive: true })
  readScroll()
}

/** Subscribe to the throttled global scroll state. */
export function subscribeScroll(fn) {
  bindScroll()
  scrollSubs.add(fn)
  fn(scroll)
  return () => scrollSubs.delete(fn)
}
