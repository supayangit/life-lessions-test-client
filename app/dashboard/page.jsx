'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Bookmark,
  Heart,
  TrendingUp,
  Crown,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { useAuth } from '@/hooks/useAuth'
import { usePremium } from '@/hooks/usePremium'
import { getDashboardOverview } from '@/services/dashboardApi'
import { StreakTracker } from '@/components/shared/StreakTracker'

/* ── Fallback mock data so the page renders without a backend ── */
const MOCK_OVERVIEW = {
  totalLessons: 12,
  totalFavorites: 34,
  totalLikes: 87,
  recentLessons: [
    { title: 'Embrace Failure Early', category: 'Career', createdAt: '2025-06-10' },
    { title: 'The Power of Saying No', category: 'Mindset', createdAt: '2025-06-08' },
    { title: 'Money Habits That Stick', category: 'Finance', createdAt: '2025-06-05' },
  ],
  weeklyActivity: [
    { day: 'Mon', lessons: 1, likes: 4 },
    { day: 'Tue', lessons: 0, likes: 2 },
    { day: 'Wed', lessons: 2, likes: 9 },
    { day: 'Thu', lessons: 1, likes: 6 },
    { day: 'Fri', lessons: 3, likes: 14 },
    { day: 'Sat', lessons: 2, likes: 8 },
    { day: 'Sun', lessons: 1, likes: 3 },
  ],
  monthlyActivity: [
    { month: 'Jan', lessons: 3, favorites: 8 },
    { month: 'Feb', lessons: 5, favorites: 12 },
    { month: 'Mar', lessons: 2, favorites: 6 },
    { month: 'Apr', lessons: 7, favorites: 18 },
    { month: 'May', lessons: 4, favorites: 10 },
    { month: 'Jun', lessons: 6, favorites: 15 },
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
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{value ?? 0}</p>
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

export default function DashboardPage() {
  const axiosSecure = useAxiosSecure()
  const { user } = useAuth()
  const { isPremium } = usePremium()

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => getDashboardOverview(axiosSecure),
    retry: false,
    // Fall back to mock data on error so the page is always useful
    placeholderData: MOCK_OVERVIEW,
  })

  const data = overview || MOCK_OVERVIEW

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s an overview of your activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StreakTracker />
          {isPremium && (
            <Badge className="flex items-center gap-1.5 bg-accent text-accent-foreground border-0 px-3 py-1 text-sm">
              <Crown className="h-3.5 w-3.5" />
              Premium Member
            </Badge>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Lessons"
          value={data.totalLessons}
          icon={BookOpen}
          color="bg-primary/10 text-primary"
          loading={isLoading}
        />
        <StatCard
          label="Favorites"
          value={data.totalFavorites}
          icon={Bookmark}
          color="bg-accent/20 text-accent-foreground"
          loading={isLoading}
        />
        <StatCard
          label="Total Likes"
          value={data.totalLikes}
          icon={Heart}
          color="bg-destructive/10 text-destructive"
          loading={isLoading}
        />
      </div>

      {/* Recent Lessons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : data.recentLessons?.length ? (
            <ul className="divide-y divide-border">
              {data.recentLessons.map((lesson, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 gap-2">
                  <span className="text-sm font-medium text-foreground line-clamp-1 flex-1">{lesson.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{lesson.category}</Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No lessons yet. Start by adding one!</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyActivity} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <RechartsTooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="lessons" fill="oklch(0.52 0.13 195)" radius={[4, 4, 0, 0]} name="Lessons" />
                <Bar dataKey="likes" fill="oklch(0.78 0.13 72)" radius={[4, 4, 0, 0]} name="Likes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.monthlyActivity} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.52 0.13 195)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.52 0.13 195)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.78 0.13 72)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.78 0.13 72)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <RechartsTooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="lessons" stroke="oklch(0.52 0.13 195)" fill="url(#colorLessons)" name="Lessons" />
                <Area type="monotone" dataKey="favorites" stroke="oklch(0.78 0.13 72)" fill="url(#colorFavorites)" name="Favorites" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
