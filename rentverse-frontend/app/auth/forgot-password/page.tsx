'use client'

import React, { useState, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ArrowLeft, Mail, KeyRound, CheckCircle, Shield, Lock } from 'lucide-react'
import ContentWrapper from '@/components/ContentWrapper'
import BoxError from '@/components/BoxError'
import InputPassword from '@/components/InputPassword'
import ButtonFilled from '@/components/ButtonFilled'
import OtpVerification from '@/components/OtpVerification'

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()

    // State
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [resetToken, setResetToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const isPasswordValid = newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword)
    const doPasswordsMatch = newPassword === confirmPassword

    // Request OTP
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setExpiresAt(data.data?.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString())
                setStep('otp')
            } else {
                setError(data.message || 'Failed to send reset code')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Verify OTP
    const handleVerifyOtp = async (otp: string) => {
        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            })

            const data = await response.json()

            if (data.success) {
                setResetToken(data.data.resetToken)
                setStep('password')
            } else {
                setError(data.message || 'Invalid code')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setExpiresAt(data.data?.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString())
            } else {
                setError(data.message || 'Failed to resend code')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!doPasswordsMatch) {
            setError('Passwords do not match')
            return
        }

        if (!isPasswordValid) {
            setError('Password must be at least 8 characters with uppercase, lowercase, and number')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword }),
            })

            const data = await response.json()

            if (data.success) {
                setStep('success')
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth/login')
                }, 3000)
            } else {
                setError(data.message || 'Failed to reset password')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Email Step
    const emailContent = (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="text-center mb-4 relative">
                <Link href="/auth/login">
                    <ArrowLeft size={20} className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600" />
                </Link>
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Forgot Password?
                </h2>
                <p className="text-sm text-slate-600">
                    Enter your email and we&apos;ll send you a code to reset your password.
                </p>
            </div>

            {error && (
                <div className="mb-6">
                    <BoxError errorTitle="Error" errorDescription={error} />
                </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <ButtonFilled type="submit" disabled={!isEmailValid || isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                </ButtonFilled>

                <div className="text-center">
                    <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    )

    // OTP Step
    const otpContent = (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="text-center mb-2 relative">
                <ArrowLeft
                    onClick={() => setStep('email')}
                    size={20}
                    className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600"
                />
            </div>

            <OtpVerification
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                expiresAt={expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString()}
                email={email}
                isLoading={isLoading}
                error={error}
                title="Enter Reset Code"
                subtitle="We've sent a 6-digit code to your email"
            />
        </div>
    )

    // Password Step
    const passwordContent = (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="text-center mb-4 relative">
                <ArrowLeft
                    onClick={() => setStep('otp')}
                    size={20}
                    className="absolute left-0 top-1 text-slate-800 cursor-pointer hover:text-slate-600"
                />
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    Set New Password
                </h2>
                <p className="text-sm text-slate-600">
                    Create a strong password for your account.
                </p>
            </div>

            {error && (
                <div className="mb-6">
                    <BoxError errorTitle="Error" errorDescription={error} />
                </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-900 mb-2">
                        New Password
                    </label>
                    <InputPassword
                        value={newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        showStrengthIndicator={true}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
                        Confirm Password
                    </label>
                    <InputPassword
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        showStrengthIndicator={false}
                    />
                    {confirmPassword && !doPasswordsMatch && (
                        <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                    )}
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-slate-700 mb-2">Password Requirements:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li className={clsx(newPassword.length >= 8 ? 'text-green-600' : 'text-slate-400')}>
                            ✓ At least 8 characters
                        </li>
                        <li className={clsx(/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-slate-400')}>
                            ✓ One uppercase letter
                        </li>
                        <li className={clsx(/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-slate-400')}>
                            ✓ One lowercase letter
                        </li>
                        <li className={clsx(/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-slate-400')}>
                            ✓ One number
                        </li>
                    </ul>
                </div>

                <ButtonFilled type="submit" disabled={!isPasswordValid || !doPasswordsMatch || isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </ButtonFilled>
            </form>
        </div>
    )

    // Success Step
    const successContent = (
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full animate-ping opacity-20" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    Password Reset! 🎉
                </h2>
                <p className="text-slate-600 mb-6">
                    Your password has been successfully changed.
                </p>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">
                            A confirmation email has been sent
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Redirecting to login...</span>
                </div>
            </div>
        </div>
    )

    // Render current step
    const getCurrentContent = () => {
        switch (step) {
            case 'email':
                return emailContent
            case 'otp':
                return otpContent
            case 'password':
                return passwordContent
            case 'success':
                return successContent
            default:
                return emailContent
        }
    }

    return (
        <ContentWrapper withFooter={false}>
            <div className="h-[calc(100vh-96px)] flex items-center justify-center p-2 sm:p-4">
                {getCurrentContent()}
            </div>
        </ContentWrapper>
    )
}
