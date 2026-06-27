'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Flag, Trash2, EyeOff, AlertTriangle, User as UserIcon, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getReportedLessons, deleteReportedLesson, ignoreReport } from '@/services/adminApi'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const MOCK_REPORTS = {
  data: [
    {
      _id: 'r1',
      lesson: { _id: 'l1', title: 'Toxic Productivity Culture' },
      reportCount: 4,
      reports: [
        { reason: 'Misleading', reporter: { name: 'Aisha R.', image: null }, createdAt: new Date().toISOString() },
        { reason: 'Spam', reporter: { name: 'Marco S.', image: null }, createdAt: new Date().toISOString() },
        { reason: 'Harassment', reporter: { name: 'Priya M.', image: null }, createdAt: new Date().toISOString() },
        { reason: 'Other', reporter: { name: 'James O.', image: null }, createdAt: new Date().toISOString() },
      ],
    },
    {
      _id: 'r2',
      lesson: { _id: 'l2', title: 'Manipulation Tactics That Work' },
      reportCount: 2,
      reports: [
        { reason: 'Inappropriate', reporter: { name: 'Selin Y.', image: null }, createdAt: new Date().toISOString() },
        { reason: 'Misleading', reporter: { name: 'Leo C.', image: null }, createdAt: new Date().toISOString() },
      ],
    },
    {
      _id: 'r3',
      lesson: { _id: 'l3', title: 'Get Rich Quick with Crypto' },
      reportCount: 7,
      reports: [
        { reason: 'Spam', reporter: { name: 'Fatima H.', image: null }, createdAt: new Date().toISOString() },
        { reason: 'Misleading', reporter: { name: 'Daniel O.', image: null }, createdAt: new Date().toISOString() },
      ],
    },
  ],
}

const REASON_COLORS = {
  Spam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Harassment: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Misleading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Inappropriate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Other: 'bg-muted text-muted-foreground',
}

function ReportsLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <div className="space-y-2 pt-1">
            {[1, 2].map((j) => <Skeleton key={j} className="h-10 w-full" />)}
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportDetailModal({ report, open, onClose }) {
  if (!report) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Reports for &quot;{report.lesson?.title}&quot;</DialogTitle>
          <DialogDescription>{report.reportCount} report{report.reportCount !== 1 ? 's' : ''} received</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {(report.reports || []).map((r, i) => {
            const initials = r.reporter?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={r.reporter?.image} alt={r.reporter?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{r.reporter?.name || 'Anonymous'}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', REASON_COLORS[r.reason] || REASON_COLORS.Other)}>
                      {r.reason}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminReportsPage() {
  const router = useRouter()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    if (!rolePending && !isAdmin) router.replace('/dashboard')
  }, [isAdmin, rolePending, router])

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => getReportedLessons(axiosSecure),
    placeholderData: MOCK_REPORTS,
    enabled: isAdmin,
    retry: false,
  })

  const { mutate: deleteLess, isPending: delPending, variables: delVars } = useMutation({
    mutationFn: (id) => deleteReportedLesson(id, axiosSecure),
    onSuccess: () => { toast.success('Lesson deleted'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }) },
    onError: () => toast.error('Failed to delete lesson'),
  })

  const { mutate: ignore, isPending: ignorePending, variables: ignoreVars } = useMutation({
    mutationFn: (id) => ignoreReport(id, axiosSecure),
    onSuccess: () => { toast.success('Report ignored'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }) },
    onError: () => toast.error('Failed to ignore report'),
  })

  const reports = data?.data || MOCK_REPORTS.data || []

  if (rolePending) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Reported Lessons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and act on community reports</p>
        </div>
        {reports.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <ReportsLoadingSkeleton />
      ) : error && !data ? (
        <ErrorState message="Failed to load reports." onRetry={() => queryClient.invalidateQueries(['admin-reports'])} />
      ) : reports.length === 0 ? (
        <EmptyState icon={Flag} title="No reports" description="The community is clean! No lesson reports to review." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => {
            const isDel = delPending && delVars === report._id
            const isIgn = ignorePending && ignoreVars === report._id
            const topReasons = [...new Set((report.reports || []).map((r) => r.reason))].slice(0, 3)

            return (
              <div key={report._id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                {/* Lesson title */}
                <div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{report.lesson?.title}</h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive" className="text-xs">{report.reportCount} reports</Badge>
                    {topReasons.map((r) => (
                      <span key={r} className={cn('text-xs px-2 py-0.5 rounded-full font-medium', REASON_COLORS[r] || REASON_COLORS.Other)}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reporters preview */}
                <div className="space-y-2">
                  {(report.reports || []).slice(0, 2).map((r, i) => {
                    const initials = r.reporter?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={r.reporter?.image} alt={r.reporter?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{r.reporter?.name || 'Anonymous'}</span>
                        <span className={cn('ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0', REASON_COLORS[r.reason] || REASON_COLORS.Other)}>
                          {r.reason}
                        </span>
                      </div>
                    )
                  })}
                  {(report.reports || []).length > 2 && (
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => setSelectedReport(report)}
                    >
                      +{report.reports.length - 2} more — view all
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => deleteLess(report._id)}
                    disabled={isDel}
                  >
                    {isDel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => ignore(report._id)}
                    disabled={isIgn}
                  >
                    {isIgn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                    Ignore
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ReportDetailModal
        report={selectedReport}
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  )
}
