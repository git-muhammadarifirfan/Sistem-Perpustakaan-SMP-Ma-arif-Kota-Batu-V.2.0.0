import { clamp } from '../lib/format'

type Props = {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 20 }: Props) {
  const v = clamp(Math.round(value), 0, 5)
  return (
	<div className="inline-flex items-center gap-1" aria-label={`Rating ${v} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1
        const active = n <= v
        return (
			<button
            key={n}
            type="button"
				className={
					'grid place-items-center rounded-full transition-transform duration-150 ' +
					(onChange ? 'cursor-pointer hover:scale-105 active:scale-95 ' : 'cursor-default ') +
					(active ? 'text-primary' : 'text-gray-300')
				}
            onClick={onChange ? () => onChange(n) : undefined}
            aria-label={`${n} star`}
            style={{ width: size, height: size }}
				disabled={!onChange}
          >
				<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
              <path d="M12 17.3l-6.18 3.73 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.76 1.64 7.03z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
