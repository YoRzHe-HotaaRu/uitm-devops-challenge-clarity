const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const digitalAgreementService = require('../services/digitalAgreement.service');
const { auth } = require('../middleware/auth');

/**
 * @route GET /api/agreements/:id
 * @desc Get agreement details with access control
 * @access Private (Landlord/Tenant only)
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await digitalAgreementService.getAgreementWithAccess(id, userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting agreement:', error);

        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get agreement'
        });
    }
});

/**
 * @route POST /api/agreements/:id/initiate
 * @desc Initiate signing workflow (send for signatures)
 * @access Private (Landlord only)
 */
router.post('/:id/initiate', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { expiresInDays } = req.body;
        const userId = req.user.id;

        // Verify user is landlord
        const agreement = await prisma.rentalAgreement.findUnique({
            where: { id },
            include: { lease: true }
        });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                error: 'Agreement not found'
            });
        }

        if (agreement.lease.landlordId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Only the landlord can initiate signing'
            });
        }

        const result = await digitalAgreementService.initiateSigningWorkflow(
            id,
            userId,
            { expiresInDays: expiresInDays || 7 }
        );

        res.json({
            success: true,
            message: 'Signing workflow initiated',
            data: result
        });
    } catch (error) {
        console.error('Error initiating signing:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/agreements/:id/sign/landlord
 * @desc Landlord signs the agreement
 * @access Private (Landlord only)
 */
router.post('/:id/sign/landlord', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { signature, confirmed } = req.body;
        const userId = req.user.id;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!signature) {
            return res.status(400).json({
                success: false,
                error: 'Signature is required'
            });
        }

        if (!confirmed) {
            return res.status(400).json({
                success: false,
                error: 'You must confirm agreement to the terms'
            });
        }

        const result = await digitalAgreementService.signAsLandlord(id, userId, {
            signature,
            confirmed,
            ipAddress
        });

        res.json({
            success: true,
            message: 'Landlord signature recorded successfully',
            data: {
                status: result.status,
                landlordSignedAt: result.landlordSignedAt,
                nextStep: 'Waiting for tenant signature'
            }
        });
    } catch (error) {
        console.error('Error signing as landlord:', error);

        if (error.message.includes('Access denied') || error.message.includes('Only the landlord')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /api/agreements/:id/sign/tenant
 * @desc Tenant signs the agreement
 * @access Private (Tenant only)
 */
router.post('/:id/sign/tenant', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { signature, confirmed } = req.body;
        const userId = req.user.id;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!signature) {
            return res.status(400).json({
                success: false,
                error: 'Signature is required'
            });
        }

        if (!confirmed) {
            return res.status(400).json({
                success: false,
                error: 'You must confirm agreement to the terms'
            });
        }

        const result = await digitalAgreementService.signAsTenant(id, userId, {
            signature,
            confirmed,
            ipAddress
        });

        res.json({
            success: true,
            message: 'Agreement signed successfully! Both parties have signed.',
            data: {
                status: result.status,
                tenantSignedAt: result.tenantSignedAt,
                completedAt: result.completedAt
            }
        });
    } catch (error) {
        console.error('Error signing as tenant:', error);

        if (error.message.includes('Access denied') || error.message.includes('Only the tenant') || error.message.includes('Landlord must sign first')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/agreements/:id/verify
 * @desc Verify document integrity (public verification)
 * @access Public (with agreement ID)
 */
router.get('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;

        const agreement = await prisma.rentalAgreement.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                documentHash: true,
                landlordSigned: true,
                landlordSignedAt: true,
                landlordSignHash: true,
                tenantSigned: true,
                tenantSignedAt: true,
                tenantSignHash: true,
                completedAt: true,
                currentVersion: true
            }
        });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                error: 'Agreement not found'
            });
        }

        res.json({
            success: true,
            data: {
                agreementId: agreement.id,
                status: agreement.status,
                documentHash: agreement.documentHash,
                signatures: {
                    landlord: {
                        signed: agreement.landlordSigned,
                        signedAt: agreement.landlordSignedAt,
                        signatureHash: agreement.landlordSignHash ? `${agreement.landlordSignHash.substring(0, 8)}...` : null
                    },
                    tenant: {
                        signed: agreement.tenantSigned,
                        signedAt: agreement.tenantSignedAt,
                        signatureHash: agreement.tenantSignHash ? `${agreement.tenantSignHash.substring(0, 8)}...` : null
                    }
                },
                completedAt: agreement.completedAt,
                documentVersion: agreement.currentVersion,
                verificationNote: 'Document hashes can be verified against the original PDF to ensure integrity'
            }
        });
    } catch (error) {
        console.error('Error verifying agreement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify agreement'
        });
    }
});

/**
 * @route POST /api/agreements/:id/cancel
 * @desc Cancel agreement (landlord only)
 * @access Private (Landlord only)
 */
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Cancellation reason is required'
            });
        }

        const result = await digitalAgreementService.cancelAgreement(id, userId, reason);

        res.json({
            success: true,
            message: 'Agreement cancelled',
            data: {
                status: result.status,
                cancelledAt: result.cancelledAt,
                reason: result.cancelReason
            }
        });
    } catch (error) {
        console.error('Error cancelling agreement:', error);

        if (error.message.includes('Only the landlord')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/agreements/:id/audit
 * @desc Get audit trail for agreement
 * @access Private (Landlord/Tenant only)
 */
router.get('/:id/audit', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const auditLogs = await digitalAgreementService.getAuditTrail(id, userId);

        res.json({
            success: true,
            data: auditLogs
        });
    } catch (error) {
        console.error('Error getting audit trail:', error);

        if (error.message.includes('Access denied')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get audit trail'
        });
    }
});

/**
 * @route GET /api/agreements/lease/:leaseId
 * @desc Get agreement by lease ID
 * @access Private (Landlord/Tenant only)
 */
router.get('/lease/:leaseId', authenticateToken, async (req, res) => {
    try {
        const { leaseId } = req.params;
        const userId = req.user.id;

        const agreement = await prisma.rentalAgreement.findUnique({
            where: { leaseId },
            include: {
                lease: {
                    include: {
                        property: { select: { id: true, title: true, address: true } },
                        landlord: { select: { id: true, name: true, email: true } },
                        tenant: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                error: 'Agreement not found for this lease'
            });
        }

        // Check access
        const hasAccess = agreement.lease.landlordId === userId ||
            agreement.lease.tenantId === userId;

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const userRole = agreement.lease.landlordId === userId ? 'landlord' : 'tenant';

        res.json({
            success: true,
            data: {
                agreement,
                userRole,
                canSign: digitalAgreementService.canUserSign(agreement, userId, userRole)
            }
        });
    } catch (error) {
        console.error('Error getting agreement by lease:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get agreement'
        });
    }
});

module.exports = router;
