/**
 * Days you were coding but no commit reached GitHub.
 *
 * This file is the source of truth for the amber "Off-GitHub Activity"
 * squares on the activity card. It is committed to the repository and read
 * by tools/build-contributions-years.mjs, so the nightly refresh keeps these
 * days instead of overwriting them.
 *
 * To record a new day, add one line:
 *
 *   { date: '2026-11-24', note: 'Local TimeCapsule work, not pushed yet' }
 *
 * Rules:
 *  - `date` must be YYYY-MM-DD.
 *  - The builder skips any date that GitHub already counts, so a day can
 *    never be both a blue square and an amber square.
 *  - Keep the note short and factual. It appears in the square's tooltip.
 */

export const MANUAL_OFF_GITHUB_NOTES = [
  {
    date: '2026-11-02',
    note: 'Local QwerNFC development, no commit pushed that day'
  },
  {
    date: '2026-11-03',
    note: 'Local QwerNFC development, no commit pushed that day'
  },
  {
    date: '2026-11-06',
    note: 'Local QwerNFC development, no commit pushed that day'
  }
]

export default MANUAL_OFF_GITHUB_NOTES
