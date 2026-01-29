import { PaymentProvider } from '../../interfaces/provider';
import { CreatePaymentPayload, PaymentResponse, RevokeResponse, StatusResponse } from '../../types';
import { ZaincashClient } from './zaincash-client';
import { ZaincashConfig } from './types';

export class ZaincashProvider implements PaymentProvider {
    name = 'zaincash';
    private client: ZaincashClient | undefined;
    private config: any;

    async init(config: ZaincashConfig): Promise<void> {
        this.config = config;
        // Allow loose init for now
        this.client = new ZaincashClient(config);
    }

    async createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse> {
        if (!this.client) throw new Error('Zaincash provider not initialized');

        try {
            const body = {
                amount: payload.amount.toString(),
                serviceType: payload.description || 'Payment',
                msisdn: this.config.msisdn,
                orderId: payload.orderId || `order-${Date.now()}`,
                redirectUrl: payload.callbackUrl || 'https://example.com/callback',
                merchantId: this.config.merchantId
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
                transactionId: data.transactionDetails?.transactionId || data.id,
                redirectUrl: data.redirectUrl,
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
            message: 'Not implemented for Zaincash',
        };
    }
}
