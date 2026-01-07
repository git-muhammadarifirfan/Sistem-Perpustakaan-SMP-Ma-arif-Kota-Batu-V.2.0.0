import { useState } from 'react'
import { Skeleton } from './Skeleton'

type Props = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  onClick?: () => void
}

export function SkeletonImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  onClick,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {!loaded ? <Skeleton className="absolute inset-0" /> : null}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
      />
    </div>
  )
}
