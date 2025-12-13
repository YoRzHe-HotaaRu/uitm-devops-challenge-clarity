'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SignaturePad from '@/components/SignaturePad';
import { createApiUrl } from '@/utils/apiConfig';
import { useAuthStore } from '@/stores/authStore';

interface Agreement {
    id: string;
    status: string;
    pdfUrl: string | null;
    landlordSigned: boolean;
    landlordSignedAt: string | null;
    tenantSigned: boolean;
    tenantSignedAt: string | null;
    completedAt: string | null;
    expiresAt: string | null;
    lease: {
        id: string;
        startDate: string;
        endDate: string;
        rentAmount: number;
        property: {
            id: string;
            title: string;
            address: string;
        };
        landlord: {
            id: string;
            name: string;
            email: string;
        };
        tenant: {
            id: string;
            name: string;
            email: string;
        };
    };
}

interface AgreementData {
    agreement: Agreement;
    userRole: 'landlord' | 'tenant';
    canSign: boolean;
}

export default function AgreementSigningPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuthStore();

    const [agreementData, setAgreementData] = useState<AgreementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [signing, setSigning] = useState(false);
    const [signSuccess, setSignSuccess] = useState(false);

    const agreementId = params?.id as string;

    // Fetch agreement data
    const fetchAgreement = useCallback(async () => {
        if (!token || !agreementId) return;

        try {
            setLoading(true);
            const response = await fetch(createApiUrl(`agreements/${agreementId}`), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load agreement');
            }

            setAgreementData(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [token, agreementId]);

    useEffect(() => {
        fetchAgreement();
    }, [fetchAgreement]);

    // Handle signature submission
    const handleSign = async () => {
        if (!signature || !confirmed || !token || !agreementData) return;

        const endpoint = agreementData.userRole === 'landlord'
            ? `agreements/${agreementId}/sign/landlord`
            : `agreements/${agreementId}/sign/tenant`;

        try {
            setSigning(true);
            const response = await fetch(createApiUrl(endpoint), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    signature,
                    confirmed,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sign agreement');
            }

            setSignSuccess(true);
            // Refresh agreement data
            await fetchAgreement();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign');
        } finally {
            setSigning(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '#10b981';
            case 'PENDING_LANDLORD': return '#f59e0b';
            case 'PENDING_TENANT': return '#3b82f6';
            case 'EXPIRED': return '#ef4444';
            case 'CANCELLED': return '#6b7280';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div className="agreement-page">
                <div className="loading-container">
                    <div className="spinner" />
                    <p>Loading agreement...</p>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="agreement-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => router.back()}>Go Back</button>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    if (!agreementData) {
        return (
            <div className="agreement-page">
                <div className="error-container">
                    <h2>Agreement Not Found</h2>
                    <button onClick={() => router.back()}>Go Back</button>
                </div>
                <style jsx>{styles}</style>
            </div>
        );
    }

    const { agreement, userRole, canSign } = agreementData;

    return (
        <div className="agreement-page">
            <div className="agreement-container">
                {/* Header */}
                <div className="agreement-header">
                    <h1>Digital Rental Agreement</h1>
                    <div
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(agreement.status) }}
                    >
                        {agreement.status.replace(/_/g, ' ')}
                    </div>
                </div>

                {/* Property Info */}
                <div className="property-info">
                    <h2>{agreement.lease.property.title}</h2>
                    <p className="address">{agreement.lease.property.address}</p>
                    <div className="lease-details">
                        <div className="detail-item">
                            <span className="label">Lease Period</span>
                            <span className="value">
                                {formatDate(agreement.lease.startDate)} - {formatDate(agreement.lease.endDate)}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Monthly Rent</span>
                            <span className="value rent">
                                RM {Number(agreement.lease.rentAmount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Parties */}
                <div className="parties-section">
                    <h3>Signing Parties</h3>

                    {/* Landlord */}
                    <div className={`party-card ${agreement.landlordSigned ? 'signed' : ''}`}>
                        <div className="party-info">
                            <span className="role">Landlord</span>
                            <span className="name">{agreement.lease.landlord.name}</span>
                            <span className="email">{agreement.lease.landlord.email}</span>
                        </div>
                        <div className="sign-status">
                            {agreement.landlordSigned ? (
                                <>
                                    <span className="signed-badge">✓ Signed</span>
                                    <span className="signed-date">
                                        {agreement.landlordSignedAt && formatDate(agreement.landlordSignedAt)}
                                    </span>
                                </>
                            ) : (
                                <span className="pending-badge">Pending</span>
                            )}
                        </div>
                    </div>

                    {/* Tenant */}
                    <div className={`party-card ${agreement.tenantSigned ? 'signed' : ''}`}>
                        <div className="party-info">
                            <span className="role">Tenant</span>
                            <span className="name">{agreement.lease.tenant.name}</span>
                            <span className="email">{agreement.lease.tenant.email}</span>
                        </div>
                        <div className="sign-status">
                            {agreement.tenantSigned ? (
                                <>
                                    <span className="signed-badge">✓ Signed</span>
                                    <span className="signed-date">
                                        {agreement.tenantSignedAt && formatDate(agreement.tenantSignedAt)}
                                    </span>
                                </>
                            ) : (
                                <span className="pending-badge">
                                    {agreement.landlordSigned ? 'Awaiting Signature' : 'Waiting for Landlord'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* PDF Preview */}
                {agreement.pdfUrl && (
                    <div className="pdf-section">
                        <h3>Agreement Document</h3>
                        <a
                            href={agreement.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link"
                        >
                            📄 View Full Agreement PDF
                        </a>
                    </div>
                )}

                {/* Signature Section */}
                {canSign && !signSuccess && (
                    <div className="signature-section">
                        <h3>Your Signature</h3>
                        <p className="instruction">
                            Please draw your signature below and check the confirmation box to sign the agreement.
                        </p>

                        <SignaturePad
                            onSignatureChange={setSignature}
                            width={400}
                            height={200}
                        />

                        <div className="confirmation-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={(e) => setConfirmed(e.target.checked)}
                                />
                                <span>
                                    I confirm that I have read and agree to all terms and conditions in this rental agreement.
                                    I understand that this digital signature is legally binding.
                                </span>
                            </label>
                        </div>

                        <button
                            className="btn-sign"
                            onClick={handleSign}
                            disabled={!signature || !confirmed || signing}
                        >
                            {signing ? 'Signing...' : `Sign as ${userRole === 'landlord' ? 'Landlord' : 'Tenant'}`}
                        </button>
                    </div>
                )}

                {/* Success Message */}
                {signSuccess && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Signature Submitted Successfully!</h3>
                        <p>
                            {agreement.status === 'COMPLETED'
                                ? 'Both parties have signed. The agreement is now complete!'
                                : 'Your signature has been recorded. Waiting for the other party to sign.'}
                        </p>
                    </div>
                )}

                {/* Completed Message */}
                {agreement.status === 'COMPLETED' && !canSign && (
                    <div className="completed-message">
                        <div className="completed-icon">🎉</div>
                        <h3>Agreement Completed</h3>
                        <p>
                            This agreement was completed on {agreement.completedAt && formatDate(agreement.completedAt)}
                        </p>
                    </div>
                )}

                {/* Expiry Warning */}
                {agreement.expiresAt && agreement.status !== 'COMPLETED' && (
                    <div className="expiry-warning">
                        ⚠️ This agreement must be signed by {formatDate(agreement.expiresAt)}
                    </div>
                )}
            </div>

            <style jsx>{styles}</style>
        </div>
    );
}

const styles = `
  .agreement-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 40px 20px;
  }

  .agreement-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: white;
    text-align: center;
    gap: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .agreement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .agreement-header h1 {
    font-size: 24px;
    color: #1a1a2e;
    margin: 0;
  }

  .status-badge {
    padding: 6px 16px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    font-weight: 500;
  }

  .property-info {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .property-info h2 {
    font-size: 20px;
    color: #1a1a2e;
    margin: 0 0 8px 0;
  }

  .property-info .address {
    color: #64748b;
    margin: 0 0 16px 0;
  }

  .lease-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-item .label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
  }

  .detail-item .value {
    font-size: 16px;
    color: #1a1a2e;
    font-weight: 500;
  }

  .detail-item .value.rent {
    color: #10b981;
    font-size: 20px;
  }

  .parties-section {
    margin-bottom: 24px;
  }

  .parties-section h3 {
    font-size: 18px;
    color: #1a1a2e;
    margin: 0 0 16px 0;
  }

  .party-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }

  .party-card.signed {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .party-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .party-info .role {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
  }

  .party-info .name {
    font-size: 16px;
    color: #1a1a2e;
    font-weight: 500;
  }

  .party-info .email {
    font-size: 14px;
    color: #64748b;
  }

  .sign-status {
    text-align: right;
  }

  .signed-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #10b981;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .signed-date {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }

  .pending-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #f59e0b;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .pdf-section {
    margin-bottom: 24px;
  }

  .pdf-section h3 {
    font-size: 18px;
    color: #1a1a2e;
    margin: 0 0 12px 0;
  }

  .pdf-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #3b82f6;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .pdf-link:hover {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  .signature-section {
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .signature-section h3 {
    font-size: 18px;
    color: #1a1a2e;
    margin: 0 0 8px 0;
  }

  .signature-section .instruction {
    color: #64748b;
    margin: 0 0 20px 0;
  }

  .confirmation-checkbox {
    margin: 20px 0;
  }

  .confirmation-checkbox label {
    display: flex;
    gap: 12px;
    cursor: pointer;
  }

  .confirmation-checkbox input {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .confirmation-checkbox span {
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
  }

  .btn-sign {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-sign:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-sign:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .success-message,
  .completed-message {
    text-align: center;
    padding: 32px;
    background: #f0fdf4;
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .success-icon,
  .completed-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .success-message h3,
  .completed-message h3 {
    color: #10b981;
    margin: 0 0 8px 0;
  }

  .success-message p,
  .completed-message p {
    color: #475569;
    margin: 0;
  }

  .expiry-warning {
    padding: 12px 16px;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    color: #92400e;
    font-size: 14px;
  }
`;
