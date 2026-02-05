"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSDK = void 0;
const alqasa_1 = require("../providers/alqasa");
const zaincash_1 = require("../providers/zaincash");
const stripe_1 = require("../providers/stripe");
const asiapay_1 = require("../providers/asiapay");
class PaymentSDK {
    constructor(config) {
        this.config = config;
        this.providers = new Map();
        this.defaultProvider = config.defaultProvider;
        // Initialize providers based on config
        if (config.providers['alqasa']) {
            const provider = new alqasa_1.AlqasaProvider();
            provider.init(config.providers['alqasa']);
            this.providers.set('alqasa', provider);
        }
        if (config.providers['zaincash']) {
            const provider = new zaincash_1.ZaincashProvider();
            // Zaincash provider init is async in our interface, but for constructor we might need to handle it.
            // Best practice: The main init() method should handle async initialization.
            this.providers.set('zaincash', new zaincash_1.ZaincashProvider());
        }
        if (config.providers['stripe']) {
            this.providers.set('stripe', new stripe_1.StripeProvider());
        }
        if (config.providers['asiapay']) {
            this.providers.set('asiapay', new asiapay_1.AsiapayProvider());
        }
    }
    /**
     * verify credentials and setup providers
     */
    async init() {
        const initPromises = [];
        this.providers.forEach((provider, name) => {
            if (this.config.providers[name]) {
                initPromises.push(provider.init(this.config.providers[name]));
            }
        });
        await Promise.all(initPromises);
    }
    /**
     * Get available payment options and their status
     */
    getPaymentOptions() {
        const options = [];
        this.providers.forEach((provider, name) => {
            options.push({
                provider: name,
                connected: true // We assume connected if initialized without error
            });
        });
        return options;
    }
    getProvider(name) {
        const providerName = name || this.defaultProvider;
        if (!providerName) {
            throw new Error('No provider specified and no default provider set');
        }
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found or not initialized`);
        }
        return provider;
    }
    async createPayment(payload, providerName) {
        const provider = this.getProvider(providerName);
        return provider.createPayment(payload);
    }
    async checkStatus(transactionId, providerName) {
        const provider = this.getProvider(providerName);
        return provider.checkStatus(transactionId);
    }
    async revoke(transactionId, providerName) {
        const provider = this.getProvider(providerName);
        return provider.revoke(transactionId);
    }
}
exports.PaymentSDK = PaymentSDK;
