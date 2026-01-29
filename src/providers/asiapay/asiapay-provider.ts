import { PaymentProvider } from '../../interfaces/provider';
import { CreatePaymentPayload, PaymentResponse, RevokeResponse, StatusResponse } from '../../types';
import { AsiapayClient } from './asiapay-client';
import { AsiapayConfig } from './types';

export class AsiapayProvider implements PaymentProvider {
    name = 'asiapay';
    private client: AsiapayClient | undefined;

    async init(config: AsiapayConfig): Promise<void> {
        if (!config.appId || !config.appSecret || !config.privateKey || !config.merchCode) {
            // throw new Error('Asiapay provider requires appId, appSecret, privateKey, merchCode');
        }
        this.client = new AsiapayClient(config);
    }

    async createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse> {
        if (!this.client) throw new Error('Asiapay provider not initialized');

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
                transactionId: data.biz_content?.prepay_id || data.biz_content?.merch_order_id,
                redirectUrl: data.biz_content?.redirect_url,
                raw: data
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message || error,
                raw: error.raw || error
            };
        }
    }

    async checkStatus(transactionId: string): Promise<StatusResponse> {
        return {
            success: true,
            status: 'PENDING',
            raw: {}
        };
    }

    async revoke(transactionId: string): Promise<RevokeResponse> {
        return {
            success: true,
            message: 'Not implemented',
        };
    }
}
