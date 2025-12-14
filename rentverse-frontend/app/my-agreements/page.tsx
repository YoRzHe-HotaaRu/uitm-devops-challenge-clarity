'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ContentWrapper from '@/components/ContentWrapper'
import { FileSignature, Calendar, User, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { createApiUrl } from '@/utils/apiConfig'

interface Agreement {
    id: string
    leaseId: string
    pdfUrl: string | null
    status: string
    landlordSigned: boolean
    landlordSignedAt: string | null
    tenantSigned: boolean
    tenantSignedAt: string | null
    completedAt: string | null
    expiresAt: string | null
    generatedAt: string
    lease: {
        id: string
        startDate: string
        endDate: string
        rentAmount: string
        currencyCode: string
        property: {
            id: string
            title: string
            address: string
            city: string
            images: string[]
        }
        tenant: {
            id: string
            name: string
            email: string
        }
        landlord: {
            id: string
            name: string
            email: string
        }
    }
}

function MyAgreementsPage() {
    const [agreements, setAgreements] = useState<Agreement[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isLoggedIn } = useAuthStore()

    useEffect(() => {
        const fetchAgreements = async () => {
            if (!isLoggedIn) {
                setIsLoading(false)
                return
            }

            try {
                const token = localStorage.getItem('authToken')
                if (!token) {
                    setError('Authentication token not found')
                    setIsLoading(false)
                    return
                }

                // Fetch agreements where user is landlord
                const response = await fetch(createApiUrl('agreements/my-agreements'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        setAgreements([])
                        setIsLoading(false)
                        return
                    }
                    throw new Error(`Failed to fetch agreements: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    setAgreements(data.data)
                } else {
                    setError('Failed to load agreements')
                }
            } catch (err) {
                console.error('Error fetching agreements:', err)
                setError(err instanceof Error ? err.message : 'Failed to load agreements')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAgreements()
    }, [isLoggedIn])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800'
            case 'PENDING_LANDLORD':
                return 'bg-yellow-100 text-yellow-800'
            case 'PENDING_TENANT':
                return 'bg-blue-100 text-blue-800'
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'EXPIRED':
                return 'bg-red-100 text-red-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return <CheckCircle size={16} className="text-green-600" />
            case 'EXPIRED':
            case 'CANCELLED':
                return <XCircle size={16} className="text-red-600" />
            case 'PENDING_LANDLORD':
            case 'PENDING_TENANT':
                return <Clock size={16} className="text-yellow-600" />
            default:
                return <AlertCircle size={16} className="text-gray-600" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status.toUpperCase()) {
            case 'DRAFT':
                return 'Draft'
            case 'PENDING_LANDLORD':
                return 'Awaiting Landlord Signature'
            case 'PENDING_TENANT':
                return 'Awaiting Tenant Signature'
            case 'COMPLETED':
                return 'Completed'
            case 'EXPIRED':
                return 'Expired'
            case 'CANCELLED':
                return 'Cancelled'
            default:
                return status
        }
    }

    if (!isLoggedIn) {
        return (
            <ContentWrapper>
                <div className="flex-1 flex items-center justify-center py-10">
                    <div className="text-center space-y-6 max-w-md">
                        <h3 className="text-xl font-sans font-medium text-slate-900">
                            Please log in to view your agreements
                        </h3>
                        <Link
                            href="/auth/login"
                            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </ContentWrapper>
        )
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <FileSignature size={28} className="text-indigo-600" />
                    <h3 className="text-2xl font-serif text-slate-900">My Agreements</h3>
                </div>
                <p className="text-sm text-slate-500">
                    Manage and sign your rental agreements
                </p>
            </div>

            {/* Contents */}
            <div className="max-w-6xl mx-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                            <p className="text-slate-600">Loading your agreements...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : agreements.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-10">
                        <div className="text-center space-y-6 max-w-md">
                            <FileSignature size={64} className="mx-auto text-slate-300" />
                            <div className="space-y-3">
                                <h3 className="text-xl font-sans font-medium text-slate-900">
                                    No agreements yet
                                </h3>
                                <p className="text-base text-slate-500 leading-relaxed">
                                    When tenants book your properties, agreements will appear here for signing.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {agreements.map((agreement) => (
                            <div
                                key={agreement.id}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Property Image */}
                                    <div className="md:w-1/4">
                                        <div className="relative h-48 md:h-full min-h-[180px]">
                                            <Image
                                                src={agreement.lease.property.images?.[0] || '/placeholder-property.jpg'}
                                                alt={agreement.lease.property.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Agreement Details */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                                        {agreement.lease.property.title}
                                                    </h3>
                                                    <div className="flex items-center text-slate-600 text-sm">
                                                        <MapPin size={14} className="mr-1" />
                                                        <span>{agreement.lease.property.address}, {agreement.lease.property.city}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(agreement.status)}`}>
                                                    {getStatusIcon(agreement.status)}
                                                    <span>{getStatusLabel(agreement.status)}</span>
                                                </div>
                                            </div>

                                            {/* Rental Period */}
                                            <div className="flex items-center text-slate-600 mb-3">
                                                <Calendar size={16} className="mr-2" />
                                                <span className="text-sm">
                                                    {formatDate(agreement.lease.startDate)} - {formatDate(agreement.lease.endDate)}
                                                </span>
                                            </div>

                                            {/* Tenant */}
                                            <div className="flex items-center text-slate-600 mb-4">
                                                <User size={16} className="mr-2" />
                                                <span className="text-sm">
                                                    Tenant: {agreement.lease.tenant.name} ({agreement.lease.tenant.email})
                                                </span>
                                            </div>

                                            {/* Signature Status */}
                                            <div className="flex flex-wrap gap-4 mb-4">
                                                <div className={`flex items-center text-sm ${agreement.landlordSigned ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {agreement.landlordSigned ? <CheckCircle size={16} className="mr-1" /> : <Clock size={16} className="mr-1" />}
                                                    Landlord: {agreement.landlordSigned ? `Signed ${agreement.landlordSignedAt ? formatDateTime(agreement.landlordSignedAt) : ''}` : 'Not signed'}
                                                </div>
                                                <div className={`flex items-center text-sm ${agreement.tenantSigned ? 'text-green-600' : 'text-slate-500'}`}>
                                                    {agreement.tenantSigned ? <CheckCircle size={16} className="mr-1" /> : <Clock size={16} className="mr-1" />}
                                                    Tenant: {agreement.tenantSigned ? `Signed ${agreement.tenantSignedAt ? formatDateTime(agreement.tenantSignedAt) : ''}` : 'Not signed'}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-auto space-y-3 sm:space-y-0">
                                                <div className="text-sm text-slate-500">
                                                    Created: {formatDate(agreement.generatedAt)}
                                                    {agreement.expiresAt && (
                                                        <span className="ml-4">Expires: {formatDate(agreement.expiresAt)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                                    <Link
                                                        href={`/agreements/${agreement.leaseId}`}
                                                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                                    >
                                                        <FileSignature size={16} />
                                                        <span>
                                                            {agreement.status === 'PENDING_LANDLORD' && !agreement.landlordSigned
                                                                ? 'Sign Agreement'
                                                                : 'View Agreement'}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ContentWrapper>
    )
}

export default MyAgreementsPage
