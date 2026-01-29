import { ZaincashConfig } from './types';
import * as jwt from 'jsonwebtoken';

export class ZaincashClient {
    private baseUrlTest = 'https://test.zaincash.iq';
    private baseUrlProd = 'https://api.zaincash.iq';

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

            // Create JWT payload with numeric timestamps (NOT using expiresIn)
            const now = Math.floor(Date.now() / 1000);
            const payload = {
                ...transactionData,
                iat: now,
                exp: now + (60 * 60 * 4)  // Token expires in 4 hours
            };

            // Generate JWT token from the payload
            jwtToken = jwt.sign(payload, this.config.secret);
        }

        // The request body should contain the token, merchantId, and lang
        const requestBody = {
            token: jwtToken,
            merchantId: body.merchantId,
            lang: body.lang || 'en'
        };

        const response = await fetch(`${this.baseUrl}/transaction/init`, {
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
