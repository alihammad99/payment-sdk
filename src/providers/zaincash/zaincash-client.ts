import { ZaincashConfig } from './types';
import * as jwt from 'jsonwebtoken';

export class ZaincashClient {
    private baseUrlTest = 'https://pg-api-uat.zaincash.iq/api/v2';
    private baseUrlProd = 'https://api.zaincash.iq/api/v2'; // Hypothetical prod URL

    constructor(private config: ZaincashConfig) { }

    private get baseUrl() {
        return this.config.production ? this.baseUrlProd : this.baseUrlTest;
    }

    async initTransaction(body: any, token?: string) {
        // Generate JWT token from the transaction data
        let jwtToken = token || this.config.token;

        if (!jwtToken) {
            // Extract merchantId from body as it should NOT be in the JWT payload
            const { merchantId, ...transactionData } = body;

            // Add lang field to the JWT payload
            const payload = {
                ...transactionData,
                lang: 'en'
            };

            // Generate JWT token from the payload with expiration
            jwtToken = jwt.sign(payload, this.config.secret, {
                algorithm: 'HS256',
                expiresIn: '1h'  // Token expires in 1 hour
            });
        }

        // The request body should contain the token, merchantId, and lang
        const requestBody = {
            token: jwtToken,
            merchantId: body.merchantId,
            lang: 'en'
        };

        const response = await fetch(`${this.baseUrl}/payment-gateway/transaction/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const text = await response.text();
        let data: any;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // Zaincash sometimes returns HTML or empty string on error
            throw { message: `Invalid response from Zaincash (Status ${response.status}): ${text.substring(0, 200)}`, raw: text, status: response.status };
        }

        return data;
    }
}
