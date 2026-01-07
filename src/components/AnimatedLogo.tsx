import { motion } from 'framer-motion'

type Props = {
  src: string
  alt?: string
}

export function AnimatedLogo({ src, alt = 'Logo' }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* glow belakang */}
      <div aria-hidden className="absolute inset-0 -z-10 blur-3xl">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25" />
        <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/18" />
      </div>

      {/* ring + logo */}
      <motion.div
        className="relative mx-auto grid aspect-square w-[300px] place-items-center rounded-[2.25rem] border border-white/10 bg-white/5 shadow-soft sm:w-[340px] md:w-[380px]"
        animate={{ y: [0, -10, 0], rotate: [0, 1.2, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* ring halus */}
        <motion.div
          aria-hidden
          className="absolute -inset-2 rounded-[2.5rem] border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative grid place-items-center rounded-[2rem] border border-white/10 bg-background/60 p-10">
          <img
            src={src}
            alt={alt}
            className="h-32 w-32 rounded-3xl object-cover sm:h-36 sm:w-36 md:h-40 md:w-40"
            draggable={false}
          />
          <div className="mt-5 text-center">
            <div className="text-xs font-semibold text-textSecondary">Aplikasi Resmi</div>
            <div className="mt-1 text-lg font-extrabold text-textPrimary">Perpustakaan Sekolah</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
