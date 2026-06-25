'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Career', 'Relationships', 'Finance', 'Health', 'Mindset',
  'Education', 'Parenting', 'Travel', 'Technology', 'Other',
]

const TONES = [
  "Inspiring",
  "Reflective",
  "Humorous",
  "Cautionary",
  "Motivational",
  "Grateful",
  "Sad",
  "Neutral"
]

export const lessonSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  tone: z.string().min(1, 'Please select a tone'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']),
  accessLevel: z.enum(['free', 'premium']),
})

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

/**
 * Shared lesson form used by Add Lesson and Update Lesson pages.
 * @param {{ defaultValues?: object, onSubmit: (data) => Promise<void>, isPremiumUser: boolean, isSubmitting: boolean, submitLabel: string }} props
 */
export function LessonForm({ defaultValues, onSubmit, isPremiumUser, isSubmitting, submitLabel = 'Save Lesson' }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tone: '',
      image: '',
      visibility: 'public',
      accessLevel: 'free',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues && (defaultValues.title || defaultValues.category)) {
      reset({
        title: defaultValues.title || '',
        description: defaultValues.description || '',
        category: defaultValues.category || '',
        tone: defaultValues.tone || '',
        image: defaultValues.image || '',
        visibility: defaultValues.visibility || 'public',
        accessLevel: defaultValues.accessLevel || 'free',
      })
    }
  }, [defaultValues, reset])

  const titleValue = watch('title')
  const descriptionValue = watch('description')
  const categoryValue = watch('category')
  const toneValue = watch('tone')
  const visibilityValue = watch('visibility')
  const accessLevelValue = watch('accessLevel')

  const handleFormSubmit = (data) => {
    console.log('Submitted Lesson Data:', data)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5 relative">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          placeholder="e.g. The lesson that changed my view on failure"
          className={titleValue ? 'pr-10' : ''}
          {...register('title')}
        />
        {titleValue ? (
          <button
            type="button"
            onClick={() => setValue('title', '', { shouldValidate: true })}
            className="absolute right-2 top-[42px] inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-muted/60"
            aria-label="Clear title"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <FieldError message={errors.title?.message} />
      </div>

      {/* Description */}
      <div className="space-y-1.5 relative">
        <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
        <Textarea
          id="description"
          placeholder="Share your experience and the lesson you learned..."
          rows={6}
          className={`resize-none ${descriptionValue ? 'pr-10' : ''}`}
          {...register('description')}
        />
        {descriptionValue ? (
          <button
            type="button"
            onClick={() => setValue('description', '', { shouldValidate: true })}
            className="absolute right-2 top-24 inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-muted/60"
            aria-label="Clear description"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <FieldError message={errors.description?.message} />
      </div>

      {/* Category & Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category <span className="text-destructive">*</span></Label>
          <Select
            value={categoryValue}
            onValueChange={(val) => setValue('category', val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Emotional Tone <span className="text-destructive">*</span></Label>
          <Select
            value={toneValue}
            onValueChange={(val) => setValue('tone', val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.tone?.message} />
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <Label htmlFor="image">Cover Image URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input id="image" type="url" placeholder="https://example.com/image.jpg" {...register('image')} />
        <FieldError message={errors.image?.message} />
      </div>

      {/* Visibility & Access Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Visibility</Label>
          <Select
            value={visibilityValue}
            onValueChange={(val) => setValue('visibility', val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.visibility?.message} />
        </div>

        {/* Access Level with premium gate */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label>Access Level</Label>
            {!isPremiumUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-center">
                  Upgrade to Premium to publish premium-access lessons
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Select
            value={accessLevelValue}
            onValueChange={(val) => {
              if (val === 'premium' && !isPremiumUser) return
              setValue('accessLevel', val, { shouldValidate: true })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem
                value="premium"
                disabled={!isPremiumUser}
                className={cn(!isPremiumUser && 'opacity-50 cursor-not-allowed')}
              >
                <span className="flex items-center gap-1.5">
                  {!isPremiumUser && <Lock className="h-3 w-3" />}
                  Premium
                  {!isPremiumUser && (
                    <span className="text-[10px] text-muted-foreground">(Upgrade to unlock)</span>
                  )}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.accessLevel?.message} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
