/**
 * Days you were coding but no commit reached GitHub.
 *
 * This file is the source of truth for the amber "Off-GitHub Activity"
 * squares on the activity card. It is committed to the repository and read
 * by tools/build-contributions-years.mjs, so the nightly refresh keeps these
 * days instead of overwriting them.
 *
 * Every entry below was verified against the real git history of the
 * QwerNFC repositories on this machine: each date has local commits while
 * both GitHub accounts report 0 for that date.
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
    date: '2026-10-25',
    note: '55 local commits in QwerNFC repos, never pushed'
  },
  {
    date: '2026-10-27',
    note: '12 local commits in QwerNFC repos, never pushed'
  },
  {
    date: '2026-10-28',
    note: '56 local commits in QwerNFC repos, never pushed'
  },
  {
    date: '2026-10-29',
    note: '121 local commits in QwerNFC repos, never pushed'
  },
  {
    date: '2026-10-30',
    note: '50 local commits in QwerNFC repos, never pushed'
  },
  {
    date: '2026-11-01',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-02',
    note: '5 local TimeCapsule commits, never pushed'
  },
  {
    date: '2026-11-03',
    note: '5 local TimeCapsule commits, never pushed'
  },
  {
    date: '2026-11-04',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-05',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-06',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-10',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-14',
    note: 'Off-GitHub local development work, not pushed to GitHub'
  },
  {
    date: '2026-11-23',
    note: 'Local portfolio & QwerNFC system architecture work, not pushed that day'
  },
  {
    date: '2026-11-25',
    note: '3 local TimeCapsule commits (device orientation engine & viewfinder framing)'
  },
  {
    date: '2026-11-26',
    note: 'Local TimeCapsule guest-camera filter grid & UI design work (35 files updated)'
  }
]

export default MANUAL_OFF_GITHUB_NOTES
