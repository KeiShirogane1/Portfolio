/**
 * Asset manifest and preloader.
 *
 * The loading screen shows a real percentage: every image the hero needs
 * (the portrait plus all 36 eye frames) and every project screenshot is counted,
 * and progress is only reported as files actually finish decoding.
 */
import { profile } from '../data/profile.js'
import { projects } from '../data/projects.js'

export function buildManifest() {
  const shots = projects.flatMap((project) => project.images)
  return [profile.portraitBase, profile.portraitIris, ...shots]
}

/** Load every URL, reporting progress 0..1 as files actually settle. */
export function preloadAssets(urls, onProgress) {
  const unique = Array.from(new Set(urls))
  const total = unique.length
  if (!total) {
    onProgress?.(1)
    return Promise.resolve()
  }

  let settled = 0
  let failed = 0

  const done = () => {
    settled += 1
    onProgress?.(settled / total, { settled, total, failed })
  }

  return new Promise((resolve) => {
    unique.forEach((src) => {
      const img = new Image()
      img.decoding = 'async'
      const finish = () => {
        img.onload = null
        img.onerror = null
        done()
        if (settled === total) resolve({ failed })
      }
      img.onload = finish
      img.onerror = () => {
        failed += 1
        finish()
      }
      img.src = src
      if (img.complete) finish()
    })
  })
}
