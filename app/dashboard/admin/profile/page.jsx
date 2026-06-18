'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, BookOpen, Users, Flag, Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/src/hooks/useAuth'
import { useRole } from '@/src/hooks/useRole'
import { useAxiosSecure } from '@/src/hooks/useAxiosSecure'
import { getAdminOverview } from '@/src/services/adminApi'
import { getMyProfile } from '@/src/services/userApi'

const MOCK_PROFILE = {
  name: 'Admin User',
  email: 'admin@lifelessons.app',
  bio: 'Platform administrator. Keeping the community safe and growing.',
  image: null,
}

const MOCK_ACTIVITY = [
  { action: 'Deleted reported lesson "Spam Post"', time: '2 hours ago' },
  { action: 'Changed user role to Premium', time: '5 hours ago' },
  { action: 'Featured lesson "Embrace Failure Early"', time: '1 day ago' },
  { action: 'Reviewed lesson "Money Habits"', time: '2 days ago' },
  { action: 'Ignored report on "Daily Gratitude"', time: '3 days ago' },
]

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className={`rounded-xl p-2.5 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()

  useEffect(() => {
    if (!rolePending && !isAdmin) router.replace('/dashboard')
  }, [isAdmin, rolePending, router])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(axiosSecure),
    placeholderData: MOCK_PROFILE,
    retry: false,
  })

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(axiosSecure),
    enabled: isAdmin,
    retry: false,
  })

  const p = profile || MOCK_PROFILE
  const displayName = p.name || user?.name || 'Admin'
  const displayEmail = p.email || user?.email || 'admin@lifelessons.app'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (rolePending) return null

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Admin Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your account overview and admin activity</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {profileLoading ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <Avatar className="h-20 w-20 flex-shrink-0">
                <AvatarImage src={p.image || user?.image} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold font-serif text-foreground">{displayName}</h2>
                    <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" />
                      Admin
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{displayEmail}</p>
                  {p.bio && (
                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{p.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatCard
              icon={Users}
              value={overview?.totalUsers ?? '—'}
              label="Total Users"
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={BookOpen}
              value={overview?.totalLessons ?? '—'}
              label="Total Lessons"
              color="bg-secondary text-secondary-foreground"
            />
            <StatCard
              icon={Flag}
              value={overview?.totalReports ?? '—'}
              label="Reports"
              color="bg-destructive/10 text-destructive"
            />
            <StatCard
              icon={ShieldCheck}
              value="Admin"
              label="Role"
              color="bg-accent/20 text-accent-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Admin Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {MOCK_ACTIVITY.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm text-foreground">{item.action}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
