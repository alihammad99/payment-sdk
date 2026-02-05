"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsiapayProvider = void 0;
const asiapay_client_1 = require("./asiapay-client");
class AsiapayProvider {
    constructor() {
        this.name = 'asiapay';
    }
    async init(config) {
        if (!config.appId || !config.appSecret || !config.privateKey || !config.merchCode) {
            // throw new Error('Asiapay provider requires appId, appSecret, privateKey, merchCode');
        }
        this.client = new asiapay_client_1.AsiapayClient(config);
    }
    async createPayment(payload) {
        var _a, _b, _c;
        if (!this.client)
            throw new Error('Asiapay provider not initialized');
        try {
            // Asiapay needs specific params
            const params = {
                amount: payload.amount.toString(),
                currency: payload.currency || 'IQD',
                orderId: payload.orderId || `order-${Date.now()}`,
                description: payload.description,
                redirectUrl: payload.callbackUrl,
                notifyUrl: payload.webhookUrl
            };
            const data = await this.client.createOrder(params);
            if (data.result !== 'SUCCESS' && data.code !== '0') {
                return {
                    success: false,
                    error: data.msg || 'Unknown error from Asiapay',
                    raw: data
                };
            }
            // data.biz_content.redirect_url contains the payment page
            return {
                success: true,
                transactionId: ((_a = data.biz_content) === null || _a === void 0 ? void 0 : _a.prepay_id) || ((_b = data.biz_content) === null || _b === void 0 ? void 0 : _b.merch_order_id),
                redirectUrl: (_c = data.biz_content) === null || _c === void 0 ? void 0 : _c.redirect_url,
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
exports.AsiapayProvider = AsiapayProvider;
