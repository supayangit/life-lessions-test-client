'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Flag, Trash2, EyeOff, AlertTriangle, Loader2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getReportedLessons, deleteReportedLesson, ignoreReport } from '@/services/adminApi'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { cn } from '@/lib/utils'

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

function formatUserId(id) {
  if (!id || id.length < 6) return id || 'Unknown'
  return `${id.slice(0, 2)}***${id.slice(-2)}`
}

export default function AdminReportsPage() {
  const router = useRouter()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [expandedReportId, setExpandedReportId] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => getReportedLessons(axiosSecure),
    enabled: isAdmin,
    retry: false,
  })

  const { mutate: deleteLess, isPending: delPending, variables: delVars } = useMutation({
    mutationFn: (lessonId) => deleteReportedLesson(lessonId, axiosSecure),
    onSuccess: () => { toast.success('Lesson deleted'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }) },
    onError: () => toast.error('Failed to delete lesson'),
  })

  const { mutate: ignore, isPending: ignorePending, variables: ignoreVars } = useMutation({
    mutationFn: (lessonId) => ignoreReport(lessonId, axiosSecure),
    onSuccess: () => { toast.success('Report ignored'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }) },
    onError: () => toast.error('Failed to ignore report'),
  })

  const reports = data?.data || []

  const getReportKey = (report) => report.lessonId || report._id || report.lesson?._id
  const getLessonId = (report) => report.lesson?._id || report.lessonId
  const getReporterId = (report) => report.reporterInfo?.reporterId || report.reporterId || report.reporter?._id
  const getReporterEmail = (report) => report.reporterInfo?.reporterEmail || report.reporter?.email

  const handleDelete = async (lessonId, title) => {
    const result = await Swal.fire({
      title: 'Delete reported lesson?',
      text: `"${title}" will be permanently removed and all reports cleared.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'oklch(0.577 0.245 27.325)',
    })
    if (result.isConfirmed) {
      deleteLess(lessonId)
    }
  }

  const handleIgnore = (lessonId) => {
    ignore(lessonId)
  }

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
        <div className="space-y-4">
          {reports.map((report) => {
            const reportKey = getReportKey(report)
            const lessonId = getLessonId(report)
            const isDel = delPending && delVars === reportKey
            const isIgn = ignorePending && ignoreVars === reportKey
            const isExpanded = expandedReportId === reportKey
            const topReasons = [...new Set((report.reports || []).map((r) => r.reason))].slice(0, 3)

            return (
              <Card key={reportKey} className="w-full">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <Link
                        href={`/lesson/${lessonId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {report.lesson?.title || 'Untitled lesson'}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.lesson?.description || report.lesson?.category || 'No description available.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-2 text-xs"
                        onClick={() => handleDelete(reportKey, report.lesson?.title || 'Lesson')}
                        disabled={isDel}
                      >
                        {isDel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-xs"
                        onClick={() => handleIgnore(reportKey)}
                        disabled={isIgn}
                      >
                        {isIgn ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                        Ignore
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-9 w-9 rounded-full transition', isExpanded && 'bg-muted')}
                        onClick={() => setExpandedReportId(isExpanded ? null : reportKey)}
                        aria-label={isExpanded ? 'Hide report details' : 'View report details'}
                      >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 rounded-xl border border-border bg-muted p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="destructive" className="text-xs">
                          {report.reportCount} report{report.reportCount !== 1 ? 's' : ''}
                        </Badge>
                        {topReasons.map((reason) => (
                          <span
                            key={reason}
                            className={cn('text-xs px-2 py-0.5 rounded-full font-medium', REASON_COLORS[reason] || REASON_COLORS.Other)}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 space-y-3">
                        {(report.reports || []).map((r, idx) => {
                          const reporterId = getReporterId(r)
                          const reporterEmail = getReporterEmail(r)
                          return (
                            <div key={idx} className="rounded-xl border border-border bg-card p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{r.reason || 'No reason provided'}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(r.reportedAt || r.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Reporter</span>
                                  <Link
                                    href={`/user/profile?userId=${reporterId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-primary hover:underline"
                                  >
                                    {formatUserId(reporterId)}
                                  </Link>
                                </div>
                              </div>
                              {reporterEmail && (
                                <p className="mt-2 text-xs text-muted-foreground">{reporterEmail}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
