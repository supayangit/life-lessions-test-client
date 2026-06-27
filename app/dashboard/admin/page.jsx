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
  Crown,
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
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getAdminOverview } from '@/services/adminApi'

// ── Animated counter ──────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!value) return
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

// ── Mock data ─────────────────────────────────────────────────────────────
const MOCK = {
  totalUsers: 1284,
  totalLessons: 347,
  totalReports: 12,
  premiumUsers: 193,
  growthData: [
    { month: 'Jan', users: 120, lessons: 30 },
    { month: 'Feb', users: 210, lessons: 52 },
    { month: 'Mar', users: 310, lessons: 78 },
    { month: 'Apr', users: 520, lessons: 110 },
    { month: 'May', users: 890, lessons: 198 },
    { month: 'Jun', users: 1284, lessons: 347 },
  ],
  topContributors: [
    { name: 'Aisha Rahman', email: 'aisha@example.com', lessonsCount: 24, image: null },
    { name: 'Marco Silva', email: 'marco@example.com', lessonsCount: 19, image: null },
    { name: 'Priya Mehta', email: 'priya@example.com', lessonsCount: 15, image: null },
    { name: 'James Okafor', email: 'james@example.com', lessonsCount: 12, image: null },
    { name: 'Selin Yıldız', email: 'selin@example.com', lessonsCount: 9, image: null },
  ],
  categoryBreakdown: [
    { category: 'Career', count: 82 },
    { category: 'Mindset', count: 71 },
    { category: 'Finance', count: 58 },
    { category: 'Relationships', count: 47 },
    { category: 'Health', count: 39 },
    { category: 'Travel', count: 30 },
    { category: 'Other', count: 20 },
  ],
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

  useEffect(() => {
    if (!rolePending && !isAdmin) router.replace('/dashboard')
  }, [isAdmin, rolePending, router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(axiosSecure),
    placeholderData: MOCK,
    enabled: isAdmin,
    retry: false,
  })

  const d = data || MOCK

  if (rolePending) return null

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
        <StatCard label="Premium Users" value={d.premiumUsers} icon={Crown} color="bg-accent/20 text-accent-foreground" loading={isLoading} />
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
              {(d.topContributors || []).map((user, i) => {
                const displayName = user?.name || user?.email || 'User'
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
                      <AvatarImage src={user?.image} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">{user?.lessonsCount ?? 0} lessons</Badge>
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
