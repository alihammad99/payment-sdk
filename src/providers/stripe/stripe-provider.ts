import { PaymentProvider } from '../../interfaces/provider';
import { CreatePaymentPayload, PaymentResponse, RevokeResponse, StatusResponse } from '../../types';
import Stripe from 'stripe';

export class StripeProvider implements PaymentProvider {
    name = 'stripe';
    private stripe: Stripe | undefined;
    private config: any;

    async init(config: any): Promise<void> {
        this.config = config;
        if (!this.config.secretKey) {
            throw new Error('Stripe provider requires secretKey');
        }
        this.stripe = new Stripe(this.config.secretKey, {
            apiVersion: '2024-12-18.acacia' as any // Force cast or use 'latest' if possible, or update to 2026 version if that's what's installed

        });
    }

    async createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse> {
        if (!this.stripe) {
            return {
                success: false,
                error: 'Stripe provider not initialized'
            };
        }

        try {
            // Create a Checkout Session
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: payload.currency,
                        product_data: {
                            name: payload.description || 'Payment',
                        },
                        unit_amount: payload.amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: payload.callbackUrl || 'http://localhost:3000/success',
                cancel_url: payload.callbackUrl || 'http://localhost:3000/cancel',
                client_reference_id: payload.orderId,
                customer_email: payload.customer?.email,
                metadata: payload.metadata
            });

            return {
                success: true,
                transactionId: session.id,
                redirectUrl: session.url || '',
                raw: session
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                raw: error
            };
        }
    }

    async checkStatus(transactionId: string): Promise<StatusResponse> {
        if (!this.stripe) {
            return { success: false, status: 'UNKNOWN', raw: { error: 'Not initialized' } };
        }
        try {
            const session = await this.stripe.checkout.sessions.retrieve(transactionId);
            let status = 'PENDING';
            if (session.payment_status === 'paid') {
                status = 'COMPLETED';
            } else if (session.status === 'expired' || session.status === 'open') {  // open is pending
                status = session.status === 'expired' ? 'FAILED' : 'PENDING';
            }

            return {
                success: true,
                status: status,
                raw: session
            };
        } catch (error: any) {
            return {
                success: false,
                status: 'UNKNOWN',
                raw: error
            };
        }
    }

    async revoke(transactionId: string): Promise<RevokeResponse> {
        if (!this.stripe) {
            return { success: false, message: 'Not initialized' };
        }
        // Stripe "revoke" usually means refund for a payment intent or expiring a session
        // For checkout session: we can expire it if it is open.
        try {
            const session = await this.stripe.checkout.sessions.expire(transactionId);
            return {
                success: true,
                message: 'Session expired',
                raw: session
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                raw: error
            };
        }
    }
}
