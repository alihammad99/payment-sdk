import { AlqasaCreatePaymentBody } from './types';

export class AlqasaClient {
    private baseUrl = 'https://api-test.alqaseh.com/v1/egw';
    private clientId?: string;
    private clientSecret?: string;
    private token?: string;

    constructor(configOrToken: string | { clientId: string; clientSecret: string; token?: string }) {
        if (typeof configOrToken === 'string') {
            this.token = configOrToken;
        } else {
            this.clientId = configOrToken.clientId;
            this.clientSecret = configOrToken.clientSecret;
            this.token = configOrToken.token;
        }
    }

    async createPayment(body: AlqasaCreatePaymentBody) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (this.clientId && this.clientSecret) {
            // Basic Auth
            const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
            headers['Authorization'] = `Basic ${credentials}`;
        } else if (this.token) {
            // Bearer Token
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}/payments/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                message: data.err || 'Alqasa API Error',
                raw: data
            };
        }

        return data;
    }
}
