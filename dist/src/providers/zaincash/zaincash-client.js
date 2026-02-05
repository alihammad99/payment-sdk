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
exports.ZaincashClient = void 0;
const jwt = __importStar(require("jsonwebtoken"));
class ZaincashClient {
    constructor(config) {
        this.config = config;
        this.baseUrlTest = 'https://test.zaincash.iq';
        this.baseUrlProd = 'https://api.zaincash.iq';
    }
    get baseUrl() {
        return this.config.production ? this.baseUrlProd : this.baseUrlTest;
    }
    async initTransaction(body, token) {
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
                exp: now + (60 * 60 * 4) // Token expires in 4 hours
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
        let data;
        try {
            data = JSON.parse(text);
        }
        catch (e) {
            // Zaincash sometimes returns HTML or empty string on error
            throw { message: `Invalid response from Zaincash (Status ${response.status}): ${text.substring(0, 200)}`, raw: text, status: response.status };
        }
        return data;
    }
}
exports.ZaincashClient = ZaincashClient;
