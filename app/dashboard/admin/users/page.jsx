'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Users, Search, Loader2, ShieldCheck, Crown, Sparkles, User as UserIcon, Trash2 } from 'lucide-react'
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
import { getAdminUsers, updateUserRole, updateUserSubscription, deleteUser } from '@/services/adminApi'
import { useDebounce } from '@/hooks/useDebounce'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  user: { label: 'User', variant: 'secondary', icon: UserIcon },
  contributor: { label: 'Contributor', variant: 'outline', icon: UserIcon },
  curator: { label: 'Curator', variant: 'secondary', icon: UserIcon },
  admin: {
    label: 'Admin',
    variant: 'destructive',
    icon: ShieldCheck,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  ceo: {
    label: 'CEO',
    variant: 'secondary',
    icon: Crown,
    className: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  },
}

const SUBSCRIPTION_LABELS = {
  free: { label: 'Free', variant: 'secondary' },
  premium: {
    label: 'Premium',
    variant: 'secondary',
    icon: Sparkles,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  admin: {
    label: 'Admin',
    variant: 'destructive',
    icon: ShieldCheck,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  ceo: {
    label: 'CEO',
    variant: 'secondary',
    icon: Crown,
    className: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
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
  const { role, isAdmin, isCeo, isPending: rolePending } = useRole()
  const isAdminUser = role === 'admin'
  const queryClient = useQueryClient()
  const axiosSecure = useAxiosSecure()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: () => getAdminUsers(axiosSecure, { search: debouncedSearch }),
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

  const { mutate: deleteUserMutate, isPending: deletingUser, variables: deleteVars } = useMutation({
    mutationFn: (userId) => deleteUser(userId, axiosSecure),
    onSuccess: () => {
      toast.success('User deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Failed to delete user'),
  })

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: 'Delete user?',
      text: `${user.name || 'This user'} will be permanently removed from the platform.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'oklch(0.577 0.245 27.325)',
    })
    if (result.isConfirmed) {
      deleteUserMutate(user._id)
    }
  }

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
            <>
              {/* Mobile Card View */}
              <div className="space-y-4 sm:hidden p-4">
                {filtered.map((user) => {
                  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.user
                  const isAdminRole = user.role === 'admin'
                  const isCeoRole = user.role === 'ceo'
                  const isTargetPrivileged = isAdminRole || isCeoRole
                  const subscriptionValue = isCeoRole ? 'ceo' : (isAdminRole ? 'admin' : (user.isPremium ? 'premium' : 'free'))
                  const subscriptionInfo = SUBSCRIPTION_LABELS[subscriptionValue]
                  const isChangingRole = changingRole && variables?.userId === user._id
                  const isChangingSubscription = changingSubscription && subVars?.userId === user._id
                  const canChangeTargetRole = isCeo || (isAdminUser && !isTargetPrivileged)
                  const canDeleteTargetUser = isCeo || (isAdminUser && !isTargetPrivileged)
                  const roleOptions = isCeo
                    ? ['user', 'contributor', 'curator', 'admin', 'ceo']
                    : ['user', 'contributor', 'curator']
                  const identityIcon = isCeoRole
                    ? Crown
                    : isAdminRole
                      ? ShieldCheck
                      : user.isPremium
                        ? Sparkles
                        : UserIcon
                  const identityIconClass = isCeoRole
                    ? 'h-3.5 w-3.5 text-violet-500'
                    : isAdminRole
                      ? 'h-3.5 w-3.5 text-destructive'
                      : user.isPremium
                        ? 'h-3.5 w-3.5 text-amber-500'
                        : 'h-3.5 w-3.5 text-muted-foreground'
                  const isDeleteDisabled = isCeoRole || !canDeleteTargetUser
                  const IdentityIcon = identityIcon

                  return (
                    <Card key={user._id} className="border border-border">
                      <CardContent className="space-y-4 pt-6">
                        {/* User Header */}
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/user/profile?userId=${user._id}`}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mb-1"
                            >
                              <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                              <IdentityIcon className={identityIconClass} />
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Lessons:</span>
                            <span className="font-medium">{user.lessonsCount ?? 0}</span>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Role</label>
                          {canChangeTargetRole ? (
                            <Select
                              value={user.role || 'user'}
                              onValueChange={(role) => changeRole({ userId: user._id, role })}
                              disabled={isChangingRole}
                            >
                              <SelectTrigger className="h-9 text-xs w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((roleOption) => (
                                  <SelectItem key={roleOption} value={roleOption}>
                                    {ROLE_LABELS[roleOption]?.label || roleOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={roleInfo.variant} className={`text-xs py-1 flex items-center gap-1 w-fit ${roleInfo.className || ''}`}>
                              {roleInfo.icon && <roleInfo.icon className="h-3.5 w-3.5" />}
                              {roleInfo.label}
                            </Badge>
                          )}
                          {isChangingRole && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Updating...</div>}
                        </div>

                        {/* Subscription */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Subscription</label>
                          {isAdmin ? (
                            <Badge variant={subscriptionInfo.variant} className={`text-xs py-1 flex items-center gap-1 w-fit ${subscriptionInfo.className || ''}`}>
                              {subscriptionInfo.icon && <subscriptionInfo.icon className="h-3.5 w-3.5" />}
                              {subscriptionInfo.label}
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                value={subscriptionValue}
                                onValueChange={(value) => changeSubscription({ userId: user._id, isPremium: value === 'premium' })}
                                disabled={isChangingSubscription}
                              >
                                <SelectTrigger className="h-9 text-xs flex-1">
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
                        </div>

                        {/* Delete Button */}
                        {!isDeleteDisabled && canDeleteTargetUser && (
                          <Button
                            variant="outline"
                            className="w-full h-9 text-xs text-destructive border-destructive/50 hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUser && deleteVars === user._id}
                          >
                            {deletingUser && deleteVars === user._id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete User
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-left">Lessons</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user) => {
                      const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                      const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.user
                      const isAdminRole = user.role === 'admin'
                      const isCeoRole = user.role === 'ceo'
                      const isTargetPrivileged = isAdminRole || isCeoRole
                      const subscriptionValue = isCeoRole ? 'ceo' : (isAdminRole ? 'admin' : (user.isPremium ? 'premium' : 'free'))
                      const subscriptionInfo = SUBSCRIPTION_LABELS[subscriptionValue]
                      const isChangingRole = changingRole && variables?.userId === user._id
                      const isChangingSubscription = changingSubscription && subVars?.userId === user._id
                      const canChangeTargetRole = isCeo || (isAdminUser && !isTargetPrivileged)
                      const canDeleteTargetUser = isCeo || (isAdminUser && !isTargetPrivileged)
                      const roleOptions = isCeo
                        ? ['user', 'contributor', 'curator', 'admin', 'ceo']
                        : ['user', 'contributor', 'curator']
                      const identityIcon = isCeoRole
                        ? Crown
                        : isAdminRole
                          ? ShieldCheck
                          : user.isPremium
                            ? Sparkles
                            : UserIcon
                      const identityIconClass = isCeoRole
                        ? 'h-3.5 w-3.5 text-violet-500'
                        : isAdminRole
                          ? 'h-3.5 w-3.5 text-destructive'
                          : user.isPremium
                            ? 'h-3.5 w-3.5 text-amber-500'
                            : 'h-3.5 w-3.5 text-muted-foreground'
                      const isDeleteDisabled = isCeoRole || !canDeleteTargetUser
                      const IdentityIcon = identityIcon

                      return (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Link href={`/user/profile?userId=${user._id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-medium text-foreground whitespace-nowrap truncate">{user.name}</span>
                                <IdentityIcon className={identityIconClass} />
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canChangeTargetRole ? (
                                <Select
                                  value={user.role || 'user'}
                                  onValueChange={(role) => changeRole({ userId: user._id, role })}
                                  disabled={isChangingRole}
                                >
                                  <SelectTrigger className="h-8 w-32 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roleOptions.map((roleOption) => (
                                      <SelectItem key={roleOption} value={roleOption}>
                                        {ROLE_LABELS[roleOption]?.label || roleOption}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={roleInfo.variant} className={`text-xs flex items-center gap-1 ${roleInfo.className || ''}`}>
                                  {roleInfo.icon && <roleInfo.icon className="h-3.5 w-3.5" />}
                                  {roleInfo.label}
                                </Badge>
                              )}
                              {isChangingRole && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-left text-sm text-muted-foreground">{user.lessonsCount ?? 0}</TableCell>
                          <TableCell>
                            {isAdmin ? (
                              <Badge variant={subscriptionInfo.variant} className={`text-xs flex items-center gap-1 ${subscriptionInfo.className || ''}`}>
                                {subscriptionInfo.icon && <subscriptionInfo.icon className="h-3.5 w-3.5" />}
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
                          <TableCell>
                            {isDeleteDisabled ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(user)}
                                disabled
                                aria-label="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : canDeleteTargetUser ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(user)}
                                disabled={deletingUser && deleteVars === user._id}
                                aria-label="Delete user"
                              >
                                {deletingUser && deleteVars === user._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Protected
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
