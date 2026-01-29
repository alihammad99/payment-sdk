import { AsiapayConfig, AsiapayCreateOrderBody } from './types';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export class AsiapayClient {
    private baseUrlTest = 'https://apitest.asiapay.iq:5443/apiaccess/payment/gateway/payment/v1';
    private baseUrlProd = 'https://api.asiapay.iq/apiaccess/payment/gateway/payment/v1'; // Hypothetical

    constructor(private config: AsiapayConfig) { }

    private get baseUrl() {
        return this.config.production ? this.baseUrlProd : this.baseUrlTest;
    }

    private signRequest(data: Record<string, any>): string {
        // The documentation implies signing the data object.
        // Usually we sign the payload with the private key/secret.
        // Docs: "sign the whole body of the request using AsiaPay PrivateKey (JWT)"
        // "sign_type": "JWTSecret"

        // We will sign the payload.
        // Algorithm usually HS256 for symmetric keys (appSecret implies symmetric?) 
        // OR RS256 if "PrivateKey" implies actual private key.
        // The docs example `createJwt(data, privateKey)` and `sign_type: JWTSecret` usually suggests HS256 if privateKey is actually a shared secret string, 
        // OR RS256 if it's a PEM.
        // Given "appSecret" AND "privateKey", maybe privateKey is for signing.
        // Let's assume HS256 with privateKey for now as strictly per docs snippet "AsiaPay PrivateKey (JWT)".

        return jwt.sign(data, this.config.privateKey, { algorithm: 'HS256' });
    }

    private async getToken(): Promise<string> {
        const response = await fetch(`${this.baseUrl}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appSecret: this.config.appSecret })
        });

        const data: any = await response.json();
        if (data.token) return data.token;
        throw new Error('Failed to get access token');
    }

    async createOrder(params: any): Promise<any> {
        const token = await this.getToken(); // Retrieve token first

        const nonce = crypto.randomUUID().replace(/-/g, '');
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const bizContent = {
            appid: this.config.appId,
            merch_code: this.config.merchCode,
            merch_order_id: params.orderId,
            total_amount: params.amount,
            trans_currency: params.currency,
            trade_type: 'Checkout',
            title: params.description || 'Payment',
            redirect_url: params.redirectUrl || '',
            notify_url: params.notifyUrl || '',
            timeout_express: '30m',
            business_type: 'BuyGoods'
        };

        const requestData: any = {
            biz_content: bizContent,
            method: 'payment.preorder',
            nonce_str: nonce,
            sign_type: 'JWTSecret',
            timestamp: timestamp,
            version: '1.0'
        };

        // Sign the request data
        const signature = this.signRequest(requestData);
        requestData.sign = signature;

        const response = await fetch(`${this.baseUrl}/merchant/preOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(requestData)
        });

        const text = await response.text();
        let data: any;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw { message: `Invalid response from Asiapay: ${text.substring(0, 100)}...`, raw: text };
        }

        return data;
    }
}
