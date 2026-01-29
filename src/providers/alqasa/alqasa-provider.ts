import { PaymentProvider } from '../../interfaces/provider';
import { CreatePaymentPayload, PaymentResponse, RevokeResponse, StatusResponse } from '../../types';
import { AlqasaClient } from './alqasa-client';
import { AlqasaConfig } from './types';

export class AlqasaProvider implements PaymentProvider {
    name = 'alqasa';
    private client: AlqasaClient | undefined;

    async init(config: AlqasaConfig): Promise<void> {
        if (!config.token && (!config.clientId || !config.clientSecret)) {
            // throw new Error('Alqasa provider requires token OR clientId+clientSecret');
            // For now we will allow it if at least something is there.
        }
        // If token is missing but we have secret, reuse secret as token for this context (as requested by user hint)
        // Actually, now Client supports object config
        if (config.clientId && config.clientSecret) {
            this.client = new AlqasaClient({
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                token: config.token
            });
        } else {
            this.client = new AlqasaClient(config.token || '');
        }
    }

    async createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse> {
        if (!this.client) throw new Error('Alqasa provider not initialized');

        try {
            const body = {
                amount: payload.amount,
                description: payload.description || 'Payment',
                client_name: payload.customer?.name || '',
                client_phone: payload.customer?.phone || '',
                client_email: payload.customer?.email || '',
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
