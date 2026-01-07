import React, { Suspense } from 'react'
import { useInView } from '../hooks/useInView'
import { Skeleton } from './Skeleton'

type Props = {
  minHeight?: number
  loader?: React.ReactNode
  children: React.ReactNode
}

export function LazySection({ minHeight = 320, loader, children }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '600px' })

  return (
    <div ref={ref} style={{ minHeight }}>
      {inView ? (
        <Suspense fallback={loader ?? <Skeleton className="h-80 w-full rounded-3xl" />}>{children}</Suspense>
      ) : (
        loader ?? <Skeleton className="h-80 w-full rounded-3xl" />
      )}
    </div>
  )
}
