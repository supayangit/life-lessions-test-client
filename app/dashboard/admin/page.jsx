'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Flag,
  TrendingUp,
  Sparkles,
  Star,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getAdminOverview } from '@/services/adminApi'

// ── Animated counter ──────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (value == null) return
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">
                <AnimatedNumber value={value ?? 0} />
              </p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(axiosSecure),
    enabled: isAdmin,
    retry: false,
  })

  const d = data ?? {
    totalUsers: 0,
    totalLessons: 0,
    totalPublicLessons: 0,
    totalReports: 0,
    premiumUsers: 0,
    growthData: [],
    topContributors: [],
    categoryBreakdown: [],
  }

  if (rolePending) return null
  if (isError) {
    return <ErrorState message="Failed to load admin overview." onRetry={refetch} />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-wide metrics and health</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={d.totalUsers} icon={Users} color="bg-primary/10 text-primary" loading={isLoading} />
        <StatCard label="Total Lessons" value={d.totalLessons} icon={BookOpen} color="bg-secondary text-secondary-foreground" loading={isLoading} />
        <StatCard label="Reports" value={d.totalReports} icon={Flag} color="bg-destructive/10 text-destructive" loading={isLoading} />
        <StatCard label="Premium Users" value={d.premiumUsers} icon={Sparkles} color="bg-accent/20 text-accent-foreground" loading={isLoading} />
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Platform Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={d.growthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.52 0.13 195)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.52 0.13 195)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.78 0.13 72)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.78 0.13 72)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="oklch(0.52 0.13 195)" fill="url(#gUsers)" name="Users" />
              <Area type="monotone" dataKey="lessons" stroke="oklch(0.78 0.13 72)" fill="url(#gLessons)" name="Lessons" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(d.topContributors || []).map((contributor, i) => {
                const displayName = contributor?.creatorName || contributor?.creatorEmail || 'Contributor'
                const initials = displayName
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={contributor?.creatorPhoto} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{contributor?.creatorEmail}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{contributor?.lessonCount ?? 0} lessons</Badge>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Lessons by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.categoryBreakdown} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="count" fill="oklch(0.52 0.13 195)" radius={[0, 4, 4, 0]} name="Lessons" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
