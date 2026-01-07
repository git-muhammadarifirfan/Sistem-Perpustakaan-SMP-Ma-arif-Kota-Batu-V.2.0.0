import { useEffect, useMemo, useState } from 'react'
import { useInView } from '../hooks/useInView'

type Props = {
  value: number
  className?: string
  durationMs?: number
  decimals?: number
  formatter?: (v: number) => string
}

/**
 * Count-up ringan dari 0 -> value saat komponen masuk viewport (sekali).
 */
export function CountUp({
  value,
  className,
  durationMs = 650,
  decimals = 0,
  formatter,
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>({ rootMargin: '120px' })
  const [n, setN] = useState(0)

  const target = useMemo(() => (Number.isFinite(value) ? value : 0), [value])

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const from = 0
    const to = target

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setN(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, durationMs])

  const text = formatter ? formatter(n) : n.toFixed(decimals)

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
