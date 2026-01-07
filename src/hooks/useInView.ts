import { useEffect, useRef, useState } from 'react'

type Options = {
  rootMargin?: string
  threshold?: number
}

export function useInView<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) setInView(true)
      },
      { rootMargin: options.rootMargin ?? '200px', threshold: options.threshold ?? 0.01 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options.rootMargin, options.threshold])

  return { ref, inView }
}
