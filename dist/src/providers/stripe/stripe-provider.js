"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeProvider = void 0;
const stripe_1 = __importDefault(require("stripe"));
class StripeProvider {
    constructor() {
        this.name = 'stripe';
    }
    async init(config) {
        this.config = config;
        if (!this.config.secretKey) {
            throw new Error('Stripe provider requires secretKey');
        }
        this.stripe = new stripe_1.default(this.config.secretKey, {
            apiVersion: '2024-12-18.acacia' // Force cast or use 'latest' if possible, or update to 2026 version if that's what's installed
        });
    }
    async createPayment(payload) {
        var _a;
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
                customer_email: (_a = payload.customer) === null || _a === void 0 ? void 0 : _a.email,
                metadata: payload.metadata
            });
            return {
                success: true,
                transactionId: session.id,
                redirectUrl: session.url || '',
                raw: session
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                raw: error
            };
        }
    }
    async checkStatus(transactionId) {
        if (!this.stripe) {
            return { success: false, status: 'UNKNOWN', raw: { error: 'Not initialized' } };
        }
        try {
            const session = await this.stripe.checkout.sessions.retrieve(transactionId);
            let status = 'PENDING';
            if (session.payment_status === 'paid') {
                status = 'COMPLETED';
            }
            else if (session.status === 'expired' || session.status === 'open') { // open is pending
                status = session.status === 'expired' ? 'FAILED' : 'PENDING';
            }
            return {
                success: true,
                status: status,
                raw: session
            };
        }
        catch (error) {
            return {
                success: false,
                status: 'UNKNOWN',
                raw: error
            };
        }
    }
    async revoke(transactionId) {
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                raw: error
            };
        }
    }
}
exports.StripeProvider = StripeProvider;
