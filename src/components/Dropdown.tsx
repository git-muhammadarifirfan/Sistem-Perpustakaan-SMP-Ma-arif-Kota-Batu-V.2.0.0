import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Align = 'left' | 'right'
type Width = 'sm' | 'md' | 'lg'

type DropdownProps = {
  button: (props: {
    open: boolean
    toggle: () => void
    buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>
  }) => React.ReactNode
  children: (props: { close: () => void }) => React.ReactNode
  align?: Align
  width?: Width
  className?: string
  menuClassName?: string
}

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ')
}

function useOnClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      const inside = refs.some((r) => r.current && r.current.contains(target))
      if (!inside) handler()
    }

    document.addEventListener('mousedown', onDown, true)
    document.addEventListener('touchstart', onDown, true)
    return () => {
      document.removeEventListener('mousedown', onDown, true)
      document.removeEventListener('touchstart', onDown, true)
    }
  }, [enabled, handler, refs])
}

export function Dropdown({
  button,
  children,
  align = 'left',
  width = 'md',
  className,
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const w = useMemo(() => {
    if (width === 'sm') return 'w-52'
    if (width === 'lg') return 'w-80'
    return 'w-64'
  }, [width])

  const close = () => setOpen(false)
  const toggle = () => setOpen((v) => !v)

  useOnClickOutside([btnRef, menuRef], close, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLElement>('[data-dd-item="true"]')
      first?.focus()
    }, 10)
    return () => window.clearTimeout(t)
  }, [open])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className={cx('relative inline-flex', className)}>
      {button({
        open,
        toggle,
        buttonProps: {
          ref: btnRef,
          type: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': `dd-${id}`,
        },
      })}

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={menuRef}
            id={`dd-${id}`}
            role="menu"
            aria-label="dropdown menu"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              'absolute z-50 mt-2 origin-top',
              alignClass,
              w,
              'rounded-2xl border border-white/10 bg-white/80 backdrop-blur-xl',
              'shadow-[0_18px_55px_rgba(2,6,23,0.18)] ring-1 ring-black/5',
              'dark:bg-slate-950/70 dark:border-white/10 dark:ring-white/10',
              menuClassName,
            )}
          >
            <div className="p-1.5">{children({ close })}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type DropdownItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function DropdownItem({
  className,
  active,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: DropdownItemProps) {
  return (
    <button
      data-dd-item="true"
      role="menuitem"
      className={cx(
        'group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold',
        'outline-none transition',
        'text-slate-800 hover:bg-emerald-500/10 hover:text-slate-950',
        'focus-visible:ring-2 focus-visible:ring-emerald-400/70',
        'dark:text-slate-100 dark:hover:bg-emerald-400/10 dark:hover:text-white',
        active ? 'bg-emerald-500/12 text-slate-950 dark:bg-emerald-400/12' : '',
        className,
      )}
      {...rest}
    >
      <span className="flex items-center gap-2">
        {leftIcon ? (
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            {leftIcon}
          </span>
        ) : null}
        <span className="leading-none">{children}</span>
      </span>

      {rightIcon ? <span className="opacity-70 transition group-hover:opacity-100">{rightIcon}</span> : null}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px w-full bg-black/5 dark:bg-white/10" />
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {children}
    </div>
  )
}
