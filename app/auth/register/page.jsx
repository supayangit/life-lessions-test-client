'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, BookOpen, Globe, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    email: z.email('Enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

function PasswordRule({ met, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? 'text-primary' : 'text-muted-foreground'}`}>
      {met ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </li>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { signup, signInWithGoogle } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [watchedPassword, setWatchedPassword] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async ({ name, email, password, image }) => {
    setLoading(true)
    try {
      const result = await signup({ name, email, password, image })
      if (result?.error) {
        toast.error(result.error.message || 'Registration failed')
      } else {
        toast.success('Account created! Welcome to LifeLessons.')
        router.push('/')
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Google sign up failed.')
      setGoogleLoading(false)
    }
  }

  const hasUppercase = /[A-Z]/.test(watchedPassword)
  const hasLowercase = /[a-z]/.test(watchedPassword)
  const hasMinLength = watchedPassword.length >= 6

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-serif font-bold text-primary text-2xl">
            <BookOpen className="h-7 w-7" />
            LifeLessons
          </Link>
          <h1 className="mt-4 text-2xl font-bold font-serif text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join thousands learning from real experiences</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Google */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            type="button"
          >
            <Globe className="h-4 w-4" />
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                {...register('name')}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-foreground mb-1.5">
                Avatar URL (optional)
              </label>
              <Input
                id="image"
                type="url"
                autoComplete="image"
                placeholder="https://example.com/avatar.jpg"
                {...register('image')}
                aria-describedby={errors.image ? 'image-error' : undefined}
              />
              {errors.image && (
                <p id="image-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password', {
                    onChange: (e) => setWatchedPassword(e.target.value),
                  })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password rules */}
              <ul className="mt-2 space-y-1 pl-0.5">
                <PasswordRule met={hasMinLength} label="At least 6 characters" />
                <PasswordRule met={hasUppercase} label="One uppercase letter" />
                <PasswordRule met={hasLowercase} label="One lowercase letter" />
              </ul>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-1.5 text-xs text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {'Already have an account? '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
