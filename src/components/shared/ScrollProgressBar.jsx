'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Scroll Progress Indicator — thin bar at the top of the page.
 * Visible only when the user scrolls past 100px.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setVisible(v > 0.01)
    })
    return unsubscribe
  }, [scrollYProgress])

  if (!visible) return null

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-primary rounded-r-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
