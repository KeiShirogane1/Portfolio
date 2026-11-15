import { contributions, GITHUB_ACCOUNTS } from '../data/contributions.js'

/**
 * "Code Contributions" card — the real, MERGED GitHub activity of BOTH
 * accounts that belong to Mark (KeiShirogane1 and TheNFCGuy).
 *
 * The data is a generated snapshot (src/data/contributions.js), refreshed by
 * `node tools/fetch-contributions.mjs`. Nothing is invented here: the dot
 * counts, the active days, the busiest day and the empty days all come from
 * GitHub's own contribution calendars, added together per day.
 *
 * The grid is plain DOM elements rather than a canvas, so it scales cleanly
 * at any width, keeps its hover tooltips accessible, and cannot fail
 * mid-paint.
 */

const LEVEL_CLASS = ['is-0', 'is-1', 'is-2', 'is-3', 'is-4']

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

  // Pad the first week so every column has seven rows lined up with the
  // weekday labels down the left edge.
  if (weeks.length && weeks[0].length < 7 && weeks[0][0]) {
    const pad = weeks[0][0].weekday
    weeks[0] = Array.from({ length: pad }, () => null).concat(weeks[0])
  }

  return weeks
}

const WEEKDAY_ROWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00Z`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila'
  })
}

function dayTitle(day) {
  if (day.offGithub) {
    return `IM ACTIVE IM DOING THIS ${day.offGithubNote} ${formatDate(day.date)}`
  }
  if (!day.count) return `Nothing on ${formatDate(day.date)} — no commits on either account`
  return `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDate(day.date)} (both accounts combined)`
}

export default function ContributionGraph() {
  const weeks = toWeeks(contributions.days)
  const { total, activeDays, emptyDays, bestDay, busiestDays } = contributions
  const allDays = activeDays + emptyDays
  const isOfficialSnapshot = contributions.source === 'github-graphql'

  return (
    <section className="contrib" id="activity" aria-label="Code contributions">
      <div className="contrib__inner">
        <div className="contrib__header">
          <div className="contrib__heading">
            <span className="contrib__badge">02 — Activity</span>
            <h2 className="contrib__title">
              Code <em className="contrib__title-em">Contributions</em>
            </h2>
            <p className="contrib__sub">
              Read straight from both of my GitHub accounts and added together,
              so one dot is the work I did across every account that day.
              Nothing added, nothing invented.
            </p>
          </div>

{isOfficialSnapshot ? (
            <div className="contrib__totals">
              <span className="contrib__total-value">{total.toLocaleString('en-US')}</span>
              <span className="contrib__total-label">contributions in the last year</span>
              <ul className="contrib__accounts">
                {GITHUB_ACCOUNTS.map((account) => (
                  <li key={account.login} className="contrib__account">
                    <a href={`https://github.com/${account.login}`} target="_blank" rel="noopener noreferrer" className="contrib__account-link">
                      {account.login}
                      <span className="contrib__account-count">{account.total.toLocaleString('en-US')}</span>
                    </a>
                    <span className="contrib__account-privacy">
                      {account.privateContributionCountsShared ? 'private included' : 'private counts not reported'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="contrib__totals contrib__totals--pending">
              <span className="contrib__total-label">official refresh required</span>
              <span className="contrib__pending-value">—</span>
              <span className="contrib__total-label">waiting for verified GitHub data</span>
            </div>
          )}
        </div>

        {isOfficialSnapshot ? (
          <div
            className="contrib__graph"
            style={{ '--contrib-cols': weeks.length }}
            role="img"
            aria-label={`${total} contributions on ${activeDays} of ${allDays} days between ${formatDate(contributions.windowStart)} and ${formatDate(contributions.windowEnd)}`}
          >
            <div className="contrib__months">
              {contributions.months.map((month) => (
                <span
                  key={`${month.label}-${month.index}`}
                  className="contrib__month"
                  style={{ gridColumn: Math.floor(month.index / 7) + 2 }}
                >
                  {month.label}
                </span>
              ))}
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
                        >
                          <span className="sr-only">{dayTitle(day)}</span>
                        </span>
                      ) : (
                        <span key={`pad-${rowIndex}`} className="contrib__cell is-empty" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="contrib__status" role="status">
            <span className="contrib__status-kicker">DATA SOURCE UPGRADE</span>
            <strong>The previous contribution snapshot did not match your GitHub profiles.</strong>
            <p>The old calendar has been hidden rather than showing misleading totals. The repository now uses GitHub's official daily GraphQL calendars and a scheduled refresh. Add the <code>GITHUB_READ_USER_TOKEN</code> Actions secret to activate it.</p>
            <a href="https://github.com/KeiShirogane1/Portfolio/actions/workflows/refresh-contributions.yml" target="_blank" rel="noopener noreferrer">Open contribution refresh workflow ↗</a>
          </div>
        )}

        {isOfficialSnapshot && (
          <>
            <div className="contrib__footer">
              <div className="contrib__legend" aria-hidden="true">
                <span className="contrib__legend-label">Less</span>
                {LEVEL_CLASS.map((level) => (
                  <span key={level} className={`contrib__cell ${level}`} />
                ))}
                <span className="contrib__legend-label">More</span>
                <span className="contrib__legend-separator">│</span>
                <span className="contrib__legend-label" style={{ color: 'rgba(255, 190, 60, 0.8)' }}>
                  Off-GitHub Activity
                </span>
                <span className="contrib__cell contrib__cell--off-github" title="Off-GitHub Development Activity" />
              </div>

              <p className="contrib__meta">
                <strong className="contrib__meta-strong">
                  {activeDays} of {allDays} days had work
                </strong>
                {' '}&middot; {emptyDays} days empty &middot; busiest day{' '}
                {bestDay.count} on {formatDate(bestDay.date)}
              </p>
            </div>

            <ul className="contrib__peaks">
              {busiestDays.map((peak) => (
                <li key={peak.date} className="contrib__peak">
                  <span className="contrib__peak-date">{formatDate(peak.date)}</span>
                  <span className="contrib__peak-bars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={`contrib__peak-bar ${index < Math.min(5, Math.ceil(peak.count / bestDay.count * 5)) ? 'is-on' : ''}`}
                      />
                    ))}
                  </span>
                  <span className="contrib__peak-count">{peak.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {isOfficialSnapshot && (
          <p className="contrib__note">
            Official GitHub GraphQL snapshot refreshed {new Date(contributions.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.
            Private and internal contribution totals are included only when GitHub returns them for the account; each profile must enable private contribution counts and the refresh token must have the read:user scope.
          </p>
        )}
      </div>
    </section>
  )
}
