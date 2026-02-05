"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlqasaClient = void 0;
class AlqasaClient {
    constructor(configOrToken) {
        this.baseUrl = 'https://api-test.alqaseh.com/v1/egw';
        if (typeof configOrToken === 'string') {
            this.token = configOrToken;
        }
        else {
            this.clientId = configOrToken.clientId;
            this.clientSecret = configOrToken.clientSecret;
            this.token = configOrToken.token;
        }
    }
    async createPayment(body) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.clientId && this.clientSecret) {
            // Basic Auth
            const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
            headers['Authorization'] = `Basic ${credentials}`;
        }
        else if (this.token) {
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
exports.AlqasaClient = AlqasaClient;
