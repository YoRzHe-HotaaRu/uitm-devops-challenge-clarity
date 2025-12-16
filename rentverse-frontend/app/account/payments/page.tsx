'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ContentWrapper from '@/components/ContentWrapper'
import useAuthStore from '@/stores/authStore'
import {
    ArrowLeft,
    CreditCard,
    Calendar,
    Home,
    CheckCircle,
    Clock,
    AlertCircle,
    Receipt,
    TrendingUp,
    Building2
} from 'lucide-react'

interface PaymentRecord {
    id: string
    propertyName: string
    propertyAddress: string
    amount: number
    currency: string
    date: string
    status: 'PAID' | 'PENDING' | 'OVERDUE'
    type: 'RENT' | 'DEPOSIT' | 'UTILITY'
    leaseId: string
}

function PaymentsPage() {
    const router = useRouter()
    const { user, isLoggedIn, initializeAuth } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState<PaymentRecord[]>([])
    const [filter, setFilter] = useState<'all' | 'PAID' | 'PENDING'>('all')

    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/auth/login')
        }
    }, [isLoggedIn, router])

    // Fetch payment history from leases
    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!user) return

            try {
                const token = localStorage.getItem('authToken')
                if (!token) return

                // Fetch user's leases to generate payment history
                const response = await fetch('/api/agreements/my-agreements', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    const leases = data.data?.agreements || data.agreements || []

                    // Transform leases into payment records
                    const paymentRecords: PaymentRecord[] = []

                    leases.forEach((lease: {
                        id: string
                        property?: { title?: string; address?: string }
                        rentAmount?: number
                        currencyCode?: string
                        startDate?: string
                        status?: string
                        securityDeposit?: number
                    }) => {
                        // Add rent payment record
                        if (lease.rentAmount) {
                            paymentRecords.push({
                                id: `${lease.id}-rent`,
                                propertyName: lease.property?.title || 'Property',
                                propertyAddress: lease.property?.address || 'Address not available',
                                amount: Number(lease.rentAmount),
                                currency: lease.currencyCode || 'MYR',
                                date: lease.startDate || new Date().toISOString(),
                                status: lease.status === 'ACTIVE' || lease.status === 'COMPLETED' ? 'PAID' : 'PENDING',
                                type: 'RENT',
                                leaseId: lease.id,
                            })
                        }

                        // Add deposit payment record if exists
                        if (lease.securityDeposit) {
                            paymentRecords.push({
                                id: `${lease.id}-deposit`,
                                propertyName: lease.property?.title || 'Property',
                                propertyAddress: lease.property?.address || 'Address not available',
                                amount: Number(lease.securityDeposit),
                                currency: lease.currencyCode || 'MYR',
                                date: lease.startDate || new Date().toISOString(),
                                status: 'PAID',
                                type: 'DEPOSIT',
                                leaseId: lease.id,
                            })
                        }
                    })

                    // Sort by date descending
                    paymentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    setPayments(paymentRecords)
                }
            } catch (error) {
                console.error('Error fetching payment history:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPaymentHistory()
    }, [user])

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const getStatusBadge = (status: PaymentRecord['status']) => {
        switch (status) {
            case 'PAID':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Paid
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock size={12} />
                        Pending
                    </span>
                )
            case 'OVERDUE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle size={12} />
                        Overdue
                    </span>
                )
        }
    }

    const getTypeBadge = (type: PaymentRecord['type']) => {
        switch (type) {
            case 'RENT':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
                        <Home size={10} />
                        Rent
                    </span>
                )
            case 'DEPOSIT':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600">
                        <Building2 size={10} />
                        Deposit
                    </span>
                )
            case 'UTILITY':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600">
                        <Receipt size={10} />
                        Utility
                    </span>
                )
        }
    }

    const filteredPayments = payments.filter(p =>
        filter === 'all' ? true : p.status === filter
    )

    // Calculate summary stats
    const totalPaid = payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)

    const pendingAmount = payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0)

    if (!isLoggedIn || !user) {
        return (
            <ContentWrapper>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                </div>
            </ContentWrapper>
        )
    }

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/account"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
                        <p className="text-slate-500">View your rental payment records</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <span className="text-green-100 text-sm">Total Paid</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(totalPaid, 'MYR')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <span className="text-yellow-100 text-sm">Pending</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(pendingAmount, 'MYR')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-teal-100 text-sm">Transactions</span>
                        </div>
                        <p className="text-2xl font-bold">{payments.length}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'PAID', 'PENDING'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Payment List */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No payments found</h3>
                            <p className="text-slate-500 mb-6">
                                {filter === 'all'
                                    ? 'You don\'t have any payment records yet.'
                                    : `No ${filter.toLowerCase()} payments found.`
                                }
                            </p>
                            <Link
                                href="/property/result"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <Home size={16} />
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Home size={24} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 mb-1">
                                                    {payment.propertyName}
                                                </h4>
                                                <p className="text-sm text-slate-500 mb-2 line-clamp-1">
                                                    {payment.propertyAddress}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getTypeBadge(payment.type)}
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {formatDate(payment.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg font-semibold text-slate-900 mb-1">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </p>
                                            {getStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-medium text-slate-900 mb-2">Need help with payments?</h3>
                    <p className="text-sm text-slate-600 mb-3">
                        If you have questions about your payment history or need to make a payment arrangement,
                        please contact your landlord or our support team.
                    </p>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                        Contact Support →
                    </Link>
                </div>
            </div>
        </ContentWrapper>
    )
}

export default PaymentsPage
