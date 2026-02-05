"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsiapayClient = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
class AsiapayClient {
    constructor(config) {
        this.config = config;
        this.baseUrlTest = 'https://apitest.asiapay.iq:5443/apiaccess/payment/gateway/payment/v1';
        this.baseUrlProd = 'https://api.asiapay.iq/apiaccess/payment/gateway/payment/v1'; // Hypothetical
    }
    get baseUrl() {
        return this.config.production ? this.baseUrlProd : this.baseUrlTest;
    }
    signRequest(data) {
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
    async getToken() {
        const response = await fetch(`${this.baseUrl}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appSecret: this.config.appSecret })
        });
        const data = await response.json();
        if (data.token)
            return data.token;
        throw new Error('Failed to get access token');
    }
    async createOrder(params) {
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
        const requestData = {
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
        let data;
        try {
            data = JSON.parse(text);
        }
        catch (e) {
            throw { message: `Invalid response from Asiapay: ${text.substring(0, 100)}...`, raw: text };
        }
        return data;
    }
}
exports.AsiapayClient = AsiapayClient;
