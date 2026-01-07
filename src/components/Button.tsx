import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Variant = 'primary' | 'ghost' | 'outline'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    leftIcon?: React.ReactNode
  }
>

export function Button({ variant = 'primary', leftIcon, children, className = '', ...rest }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:opacity-50 disabled:cursor-not-allowed'

  const styles: Record<Variant, string> = {
    primary:
      'bg-gradient-to-b from-primary to-primary-dark text-white shadow-soft hover:brightness-105 hover:shadow-lift active:scale-[0.99]',
    outline:
      'bg-white/5 text-textPrimary border border-white/12 shadow-soft hover:bg-white/8 hover:border-white/20 hover:shadow-lift',
    ghost:
      'bg-transparent text-textPrimary hover:bg-white/6 hover:shadow-soft',
  }

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {leftIcon ? <span className="-ml-0.5 inline-flex">{leftIcon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
