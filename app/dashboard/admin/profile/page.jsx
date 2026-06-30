'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, Crown, BookOpen, Users, Flag, Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getAdminOverview } from '@/services/adminApi'
import { getMyProfile } from '@/services/userApi'

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
  const { role, isAdmin, isCeo, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(axiosSecure),
    retry: false,
  })

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => getAdminOverview(axiosSecure),
    enabled: isAdmin,
    retry: false,
  })

  const p = profile ?? {}
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
                    {isCeo ? (
                      <Badge className="flex items-center gap-1 bg-violet-100 text-violet-700 border border-violet-200 text-xs">
                        <Crown className="h-3 w-3" />
                        CEO
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
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
              icon={isCeo ? Crown : ShieldCheck}
              value={isCeo ? 'CEO' : 'Admin'}
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
          <div className="text-sm text-muted-foreground py-8 text-center">
            Recent admin activity is not available in this view.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
