'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Crown,
  Zap,
  Star,
  BookOpen,
  MessageSquare,
  Download,
  Share2,
  Eye,
  Heart,
  Bookmark,
  Users,
  Shield,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAxiosSecure } from '@/src/hooks/useAxiosSecure'
import { useRole } from '@/src/hooks/useRole'
import { usePremium } from '@/src/hooks/usePremium'
import { createCheckoutSession } from '@/src/services/paymentsApi'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const COMPARISON_ROWS = [
  { feature: 'Read free lessons', free: true, premium: true, icon: BookOpen },
  { feature: 'Like & save lessons', free: true, premium: true, icon: Heart },
  { feature: 'Write & publish lessons', free: true, premium: true, icon: BookOpen },
  { feature: 'Comment on lessons', free: true, premium: true, icon: MessageSquare },
  { feature: 'Access to premium lessons', free: false, premium: true, icon: Crown },
  { feature: 'PDF export of any lesson', free: false, premium: true, icon: Download },
  { feature: 'Social sharing tools', free: false, premium: true, icon: Share2 },
  { feature: 'Unlimited lesson visibility', free: false, premium: true, icon: Eye },
  { feature: 'Bookmark animations', free: false, premium: true, icon: Bookmark },
  { feature: 'Priority support', free: false, premium: true, icon: Shield },
  { feature: 'Early access to new features', free: false, premium: true, icon: Star },
  { feature: 'Contributor spotlight eligibility', free: false, premium: true, icon: Users },
]

const PREMIUM_HIGHLIGHTS = [
  { icon: Crown, title: 'All Premium Content', desc: 'Unlock every premium lesson from our top contributors.' },
  { icon: Download, title: 'PDF Export', desc: 'Export any lesson to PDF for offline reading.' },
  { icon: Share2, title: 'Social Sharing', desc: 'Share lessons to social media with beautiful cards.' },
  { icon: Zap, title: 'Lifetime Access', desc: 'Pay once, enjoy forever. No subscriptions.' },
]

function CheckIcon({ value }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" aria-label="Included" />
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/50 mx-auto" aria-label="Not included" />
  return <span className="text-sm text-muted-foreground mx-auto block text-center">{value}</span>
}

export default function PricingPage() {
  const axiosSecure = useAxiosSecure()
  const { isFree, isPending: rolePending } = useRole()
  const { isPremium } = usePremium()

  const { mutate: checkout, isPending } = useMutation({
    mutationFn: () => createCheckoutSession(axiosSecure),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error('Unable to start checkout. Please try again.')
      }
    },
    onError: () => {
      toast.error('Failed to initiate checkout. Please try again.')
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Badge className="mb-4 bg-accent/20 text-accent-foreground border-0 px-3 py-1 text-sm font-medium">
            <Crown className="h-3.5 w-3.5 mr-1.5" />
            Lifetime Access
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-foreground text-balance leading-tight">
            Unlock the Full Wisdom Library
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance leading-relaxed">
            One simple price. Lifetime access. Read premium lessons from real people who have lived through it.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-8 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Free</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">৳0</span>
                <span className="text-muted-foreground ml-2 text-sm">forever</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Get started with the basics. Read free lessons and share your own experiences with the community.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {COMPARISON_ROWS.filter((r) => r.free).map((row) => (
                  <li key={row.feature} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {row.feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative overflow-hidden"
            >
              {/* Popular badge */}
              <div className="absolute top-5 right-5">
                <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Premium</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">৳1,500</span>
                <span className="text-muted-foreground ml-2 text-sm">lifetime</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Full access to every lesson, export tools, and premium features. Pay once, own it forever.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {COMPARISON_ROWS.map((row) => (
                  <li
                    key={row.feature}
                    className={cn(
                      'flex items-center gap-2.5 text-sm',
                      row.premium ? 'text-foreground' : 'text-muted-foreground/50 line-through'
                    )}
                  >
                    <Check className={cn('h-4 w-4 flex-shrink-0', row.premium ? 'text-primary' : 'text-muted-foreground/40')} />
                    {row.feature}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <Button className="w-full" disabled>
                  <Crown className="h-4 w-4 mr-2" />
                  You&apos;re already Premium
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => checkout()}
                  disabled={isPending || rolePending}
                >
                  {isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting...</>
                  ) : (
                    <><Crown className="h-4 w-4 mr-2" /> Upgrade to Premium</>
                  )}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Full Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-serif text-center text-foreground mb-10 text-balance">
            Full Feature Comparison
          </h2>
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {/* Header */}
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-4 text-sm font-semibold text-foreground">Feature</div>
              <div className="p-4 text-sm font-semibold text-foreground text-center">Free</div>
              <div className="p-4 text-sm font-semibold text-primary text-center flex items-center justify-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> Premium
              </div>
            </div>
            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={cn(
                  'grid grid-cols-3 border-b border-border last:border-0',
                  i % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                )}
              >
                <div className="p-4 flex items-center gap-2 text-sm text-foreground">
                  <row.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {row.feature}
                </div>
                <div className="p-4 flex items-center justify-center">
                  <CheckIcon value={row.free} />
                </div>
                <div className="p-4 flex items-center justify-center">
                  <CheckIcon value={row.premium} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Highlights */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-serif text-center text-foreground mb-10 text-balance">
            Why Go Premium?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PREMIUM_HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card gap-3"
              >
                <div className="rounded-xl bg-primary/10 p-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isPremium && (
        <section className="pb-20 px-4">
          <div className="max-w-xl mx-auto rounded-2xl bg-primary/5 border border-primary/20 p-10 text-center">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-serif text-foreground text-balance">
              Ready to unlock everything?
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Join premium members accessing the best life wisdom on the platform.
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => checkout()}
              disabled={isPending || rolePending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                'Get Lifetime Premium — ৳1,500'
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Secure checkout via Stripe. One-time payment.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
