'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const SLIDES = [
  {
    id: 1,
    title: 'Every Scar Has a Story Worth Telling',
    subtitle: 'Share the experiences that shaped you and help others avoid your hardest lessons.',
    cta: 'Browse Lessons',
    ctaHref: '/public-lessons',
    accent: 'from-primary/80 via-primary/60 to-transparent',
    bg: 'from-slate-900 via-teal-950 to-slate-900',
  },
  {
    id: 2,
    title: 'Wisdom Is the Gift of Lived Experience',
    subtitle: 'Join thousands who have shared their journeys and found community in vulnerability.',
    cta: 'Start Sharing',
    ctaHref: '/auth/register',
    accent: 'from-accent/70 via-amber-900/50 to-transparent',
    bg: 'from-stone-900 via-amber-950 to-stone-900',
  },
  {
    id: 3,
    title: 'Learn Before Life Forces the Lesson',
    subtitle: 'Access hundreds of real life lessons across relationships, career, health, and more.',
    cta: 'Explore Now',
    ctaHref: '/public-lessons',
    accent: 'from-teal-800/80 via-teal-900/60 to-transparent',
    bg: 'from-slate-900 via-cyan-950 to-slate-900',
  },
]

const textVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

export function HeroSlider() {
  useEffect(() => {
    console.log('[HeroSlider] slides', SLIDES)
  }, [])

  return (
    <section aria-label="Hero" className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation
        loop
        className="h-[520px] sm:h-[600px] lg:h-[680px]"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => (
              <div
                className={`relative h-full w-full flex items-center bg-gradient-to-br ${slide.bg}`}
              >
                {/* Decorative overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />
                <div className="absolute inset-0 bg-black/30" />

                {/* Decorative pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />

                {/* Content */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    {isActive && (
                      <>
                        <motion.div
                          custom={0}
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-accent px-3 py-1 rounded-full border border-accent/40">
                            Digital Life Lessons
                          </span>
                        </motion.div>

                        <motion.h1
                          custom={1}
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance"
                        >
                          {slide.title}
                        </motion.h1>

                        <motion.p
                          custom={2}
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed max-w-lg"
                        >
                          {slide.subtitle}
                        </motion.p>

                        <motion.div
                          custom={3}
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          className="mt-8 flex gap-3 flex-wrap"
                        >
                          <Button size="lg" asChild className="gap-2">
                            <Link href={slide.ctaHref}>
                              {slide.cta}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="border-white/40 text-white hover:bg-white/10 bg-transparent hover:text-white"
                          >
                            <Link href="/auth/register">Join Free</Link>
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
