import { useMemo } from 'react'

/**
 * Staggered headline reveal.
 *
 * Accepts either a single `text` string or a `lines` array, so a headline can
 * be split across rows and each row can carry its own delay and accent tone.
 * A line looks like { text, delay } where delay is in seconds.
 *
 * The whole string stays available to screen readers through aria-label, so
 * splitting can never garble what is read out.
 */
export default function SplitText({
  text,
  lines,
  as,
  tag,
  mode = 'chars',
  className = '',
  delay = 0,
  step = 26,
  id
}) {
  const Tag = as || tag || 'span'

  /* Keep the prop names straight regardless of which one the caller used. */
  const rows = useMemo(() => {
    if (Array.isArray(lines) && lines.length) {
      return lines.map((line) =>
        typeof line === 'string' ? { text: line, delay: 0 } : line
      )
    }
    return [{ text: text ?? '', delay: 0 }]
  }, [text, lines])

  const plainLabel = rows.map((row) => row.text).join(' ')

  /*
   * Words stay whole so a long name still wraps between them; inside each
   * word the letters are what actually animate.
   */
  const prepared = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      words: String(row.text ?? '')
        .split(' ')
        .filter(Boolean)
        .map((word) => (mode === 'words' ? [word] : word.split('')))
    }))
  }, [rows, mode])

  let index = 0

  return (
    <Tag
      className={`splitText splitText--${mode} ${className}`.trim()}
      id={id}
      aria-label={plainLabel}
    >
      {prepared.map((row, r) => {
        const base = Number(row.delay || 0) * 1000 + Number(delay || 0)
        return (
          <span
            key={`line-${r}`}
            className={`splitText__line${row.accent ? ' splitText__line--accent' : ''}`}
            aria-hidden="true"
          >
            {row.words.map((letters, w) => (
              <span key={`w-${r}-${w}`} className="splitText__word">
                {letters.map((value, c) => {
                  const style = {
                    '--i': index,
                    '--split-base': `${base}ms`,
                    '--split-step': `${step}ms`
                  }
                  index += 1
                  return (
                    <span key={`${value}-${c}`} className="splitText__unit" style={style}>
                      {value}
                    </span>
                  )
                })}
                {w < row.words.length - 1 && <span className="splitText__space">{' '}</span>}
              </span>
            ))}
          </span>
        )
      })}
    </Tag>
  )
}
