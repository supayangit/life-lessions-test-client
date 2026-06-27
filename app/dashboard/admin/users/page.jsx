'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Users, Search, Loader2, ShieldCheck, Crown, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getAdminUsers, updateUserRole, updateUserSubscription } from '@/services/adminApi'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  user: { label: 'User', variant: 'secondary', icon: UserIcon },
  contributor: { label: 'Contributor', variant: 'outline', icon: UserIcon },
  admin: { label: 'Admin', variant: 'destructive', icon: ShieldCheck },
}

const SUBSCRIPTION_LABELS = {
  free: { label: 'Free', variant: 'secondary' },
  premium: { label: 'Premium', variant: 'outline', className: 'border-accent text-accent-foreground' },
  admin: { label: 'Admin', variant: 'destructive' },
}

const MOCK_USERS = {
  users: Array.from({ length: 8 }, (_, i) => ({
    _id: `user-${i}`,
    name: ['Aisha Rahman', 'Marco Silva', 'Priya Mehta', 'James Okafor', 'Selin Yıldız', 'Leo Chen', 'Fatima Al-Hassan', 'Daniel Owusu'][i],
    email: `user${i}@example.com`,
    role: ['user', 'user', 'user', 'admin', 'user', 'user', 'user', 'user'][i],
    isPremium: [false, true, false, false, false, true, false, false][i],
    lessonsCount: [24, 19, 15, 12, 9, 7, 5, 3][i],
    image: null,
    createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  pagination: {
    total: 8,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
}

function UserTableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    if (!rolePending && !isAdmin) router.replace('/dashboard')
  }, [isAdmin, rolePending, router])

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: () => getAdminUsers(axiosSecure, { search: debouncedSearch }),
    placeholderData: MOCK_USERS,
    enabled: isAdmin,
    retry: false,
  })

  const { mutate: changeRole, isPending: changingRole, variables } = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role, axiosSecure),
    onSuccess: () => {
      toast.success('Role updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Failed to update role'),
  })

  const { mutate: changeSubscription, isPending: changingSubscription, variables: subVars } = useMutation({
    mutationFn: ({ userId, isPremium }) => updateUserSubscription(userId, isPremium, axiosSecure),
    onSuccess: () => {
      toast.success('Subscription updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Failed to update subscription'),
  })

  const users = data?.users || []

  const filtered = debouncedSearch
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : users

  if (rolePending) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage all platform users</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {users.length} users
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <UserTableSkeleton />
          ) : error && !data ? (
            <ErrorState message="Failed to load users." onRetry={() => queryClient.invalidateQueries(['admin-users'])} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try adjusting your search." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Lessons</TableHead>
                    <TableHead>Subscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                    const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.user
                    const isAdmin = user.role === 'admin'
                    const subscriptionValue = isAdmin ? 'admin' : (user.isPremium ? 'premium' : 'free')
                    const subscriptionInfo = SUBSCRIPTION_LABELS[subscriptionValue]
                    const isChangingRole = changingRole && variables?.userId === user._id
                    const isChangingSubscription = changingSubscription && subVars?.userId === user._id

                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground whitespace-nowrap">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role || 'user'}
                              onValueChange={(role) => changeRole({ userId: user._id, role })}
                              disabled={isChangingRole}
                            >
                              <SelectTrigger className="h-8 w-32 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="contributor">Contributor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            {isChangingRole && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{user.lessonsCount ?? 0}</TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Badge variant={subscriptionInfo.variant} className={subscriptionInfo.className || ''}>
                              {subscriptionInfo.label}
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                value={subscriptionValue}
                                onValueChange={(value) => changeSubscription({ userId: user._id, isPremium: value === 'premium' })}
                                disabled={isChangingSubscription}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                              {isChangingSubscription && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
