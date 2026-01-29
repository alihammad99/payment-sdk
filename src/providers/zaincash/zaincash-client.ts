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
        // Generate JWT token from the body data if not provided
        let authToken = token || this.config.token;

        if (!authToken) {
            // Generate JWT token from the body
            authToken = jwt.sign(body, this.config.secret, {
                algorithm: 'HS256'
            });
        }

        const response = await fetch(`${this.baseUrl}/payment-gateway/transaction/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body)
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
