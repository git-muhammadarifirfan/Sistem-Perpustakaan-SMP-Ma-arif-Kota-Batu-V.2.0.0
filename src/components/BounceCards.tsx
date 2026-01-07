import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './BounceCards.css'

type Size = number | string

type Props = {
  className?: string
  images: string[]
  containerWidth?: Size
  containerHeight?: Size
  animationDelay?: number
  animationStagger?: number
  easeType?: string
  transformStyles?: string[]
  enableHover?: boolean
  onCardClick?: (src: string, index: number) => void
}

export default function BounceCards({
  className = '',
  images,
  containerWidth = 'min(420px, 100%)',
  containerHeight = 'min(420px, 88vw)',
  animationDelay = 0.35,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(6deg) translate(-150px)',
    'rotate(2deg) translate(-70px)',
    'rotate(-2deg)',
    'rotate(2deg) translate(70px)',
    'rotate(-6deg) translate(150px)'
  ],
  enableHover = true,
  onCardClick
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bc-card',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, stagger: animationStagger, ease: easeType, delay: animationDelay, duration: 0.8 }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [animationStagger, easeType, animationDelay])

  const getNoRotationTransform = (transformStr: string) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr)
    if (hasRotate) return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)')
    if (transformStr === 'none') return 'rotate(0deg)'
    return `${transformStr} rotate(0deg)`
  }

  const getPushedTransform = (baseTransform: string, offsetX: number) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/
    const match = baseTransform.match(translateRegex)
    if (match) {
      const currentX = parseFloat(match[1])
      const newX = currentX + offsetX
      return baseTransform.replace(translateRegex, `translate(${newX}px)`)
    }
    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`
  }

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)

    images.forEach((_, i) => {
      const target = q(`.bc-card-${i}`)
      gsap.killTweensOf(target)
      const baseTransform = transformStyles[i] || 'none'

      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.35,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        })
      } else {
        const offsetX = i < hoveredIdx ? -140 : 140
        const pushedTransform = getPushedTransform(baseTransform, offsetX)
        const delay = Math.abs(hoveredIdx - i) * 0.04

        gsap.to(target, {
          transform: pushedTransform,
          duration: 0.35,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        })
      }
    })
  }

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return
    const q = gsap.utils.selector(containerRef)

    images.forEach((_, i) => {
      const target = q(`.bc-card-${i}`)
      gsap.killTweensOf(target)
      gsap.to(target, {
        transform: transformStyles[i] || 'none',
        duration: 0.35,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      })
    })
  }

  return (
    <div ref={containerRef} className={`bc-container ${className}`} style={{ width: containerWidth, height: containerHeight }}>
      {images.map((src, idx) => (
        <button
          key={`${src}-${idx}`}
          type="button"
          className={`bc-card bc-card-${idx}`}
          style={{ transform: transformStyles[idx] ?? 'none' }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
          onClick={() => onCardClick?.(src, idx)}
          aria-label={`Open screenshot ${idx + 1}`}
        >
          <img className="bc-image" src={src} alt={`screenshot-${idx + 1}`} loading="lazy" />
        </button>
      ))}
    </div>
  )
}
