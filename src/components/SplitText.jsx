import { useMemo } from 'react'

/**
 * Staggered headline reveal.
 *
 * Splits a line into characters or words and animates each one in sequence.
 * The full string stays available to screen readers through aria-label, so
 * splitting can never garble what is read out.
 */
export default function SplitText({
  text,
  as: Tag = 'span',
  mode = 'chars',
  className = '',
  delay = 0,
  step = 26,
  id
}) {
  /*
   * Words stay whole so a long name still wraps between them; inside each
   * word the letters are what actually animate.
   */
  const words = useMemo(() => {
    return text
      .split(' ')
      .map((word) => (mode === 'words' ? [word] : word.split('')))
      .filter((part) => part.length)
  }, [text, mode])

  let index = 0

  return (
    <Tag className={`splitText splitText--${mode} ${className}`.trim()} id={id} aria-label={text}>
      {words.map((letters, w) => (
        <span key={`w-${w}`} className="splitText__word" aria-hidden="true">
          {letters.map((value, c) => {
            const style = {
              '--i': index,
              '--split-base': `${delay}ms`,
              '--split-step': `${step}ms`
            }
            index += 1
            return (
              <span key={`${value}-${c}`} className="splitText__unit" style={style}>
                {value}
              </span>
            )
          })}
          {w < words.length - 1 && <span className="splitText__space">{' '}</span>}
        </span>
      ))}
    </Tag>
  )
}
