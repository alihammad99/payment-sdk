"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaincashProvider = void 0;
const zaincash_client_1 = require("./zaincash-client");
class ZaincashProvider {
    constructor() {
        this.name = 'zaincash';
    }
    async init(config) {
        this.config = config;
        // Allow loose init for now
        this.client = new zaincash_client_1.ZaincashClient(config);
    }
    async createPayment(payload) {
        var _a;
        if (!this.client)
            throw new Error('Zaincash provider not initialized');
        try {
            const body = {
                amount: payload.amount.toString(),
                serviceType: payload.description || 'Payment',
                msisdn: this.config.msisdn,
                orderId: payload.orderId || `order-${Date.now()}`,
                redirectUrl: payload.callbackUrl || 'https://example.com/callback',
                merchantId: this.config.merchantId,
                lang: 'en'
            };
            const data = await this.client.initTransaction(body);
            if (data.status !== 'SUCCESS' && !data.id) {
                return {
                    success: false,
                    error: data.msg || data.message || 'Unknown error from Zaincash',
                    raw: data
                };
            }
            return {
                success: true,
                transactionId: ((_a = data.transactionDetails) === null || _a === void 0 ? void 0 : _a.transactionId) || data.id,
                redirectUrl: data.redirectUrl,
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
            message: 'Not implemented for Zaincash',
        };
    }
}
exports.ZaincashProvider = ZaincashProvider;
