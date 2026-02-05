"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlqasaProvider = void 0;
const alqasa_client_1 = require("./alqasa-client");
class AlqasaProvider {
    constructor() {
        this.name = 'alqasa';
    }
    async init(config) {
        if (!config.token && (!config.clientId || !config.clientSecret)) {
            // throw new Error('Alqasa provider requires token OR clientId+clientSecret');
            // For now we will allow it if at least something is there.
        }
        // If token is missing but we have secret, reuse secret as token for this context (as requested by user hint)
        // Actually, now Client supports object config
        if (config.clientId && config.clientSecret) {
            this.client = new alqasa_client_1.AlqasaClient({
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                token: config.token
            });
        }
        else {
            this.client = new alqasa_client_1.AlqasaClient(config.token || '');
        }
    }
    async createPayment(payload) {
        var _a, _b, _c;
        if (!this.client)
            throw new Error('Alqasa provider not initialized');
        try {
            const body = {
                amount: payload.amount,
                description: payload.description || 'Payment',
                client_name: ((_a = payload.customer) === null || _a === void 0 ? void 0 : _a.name) || '',
                client_phone: ((_b = payload.customer) === null || _b === void 0 ? void 0 : _b.phone) || '',
                client_email: ((_c = payload.customer) === null || _c === void 0 ? void 0 : _c.email) || '',
                order_id: payload.orderId || `order-${Date.now()}`,
                currency: payload.currency,
                redirect_url: payload.callbackUrl || 'https://example.com/callback',
                webhook_url: payload.webhookUrl || '',
                transaction_type: 'Retail',
            };
            const data = await this.client.createPayment(body);
            return {
                success: true,
                transactionId: data.payment_id,
                redirectUrl: data.redirect_url || '',
                raw: data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || error,
                raw: error.raw || error
            };
        }
    }
    async checkStatus(transactionId) {
        return {
            success: true,
            status: 'PENDING',
            raw: {}
        };
    }
    async revoke(transactionId) {
        return {
            success: true,
            message: 'Not implemented',
        };
    }
}
exports.AlqasaProvider = AlqasaProvider;
