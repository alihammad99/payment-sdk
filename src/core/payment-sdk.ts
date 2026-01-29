import { PaymentProvider } from '../interfaces/provider';
import { AlqasaProvider } from '../providers/alqasa';
import { ZaincashProvider } from '../providers/zaincash';
import { StripeProvider } from '../providers/stripe';
import { AsiapayProvider } from '../providers/asiapay';
import { SDKConfig, CreatePaymentPayload, PaymentResponse, StatusResponse, RevokeResponse, AvailableOption } from '../types';

export class PaymentSDK {
    private providers: Map<string, PaymentProvider> = new Map();
    private defaultProvider?: string;

    constructor(private config: SDKConfig) {
        this.defaultProvider = config.defaultProvider;

        // Initialize providers based on config
        if (config.providers['alqasa']) {
            const provider = new AlqasaProvider();
            provider.init(config.providers['alqasa']);
            this.providers.set('alqasa', provider);
        }

        if (config.providers['zaincash']) {
            const provider = new ZaincashProvider();
            // Zaincash provider init is async in our interface, but for constructor we might need to handle it.
            // Best practice: The main init() method should handle async initialization.
            this.providers.set('zaincash', new ZaincashProvider());
        }

        if (config.providers['stripe']) {
            this.providers.set('stripe', new StripeProvider());
        }

        if (config.providers['asiapay']) {
            this.providers.set('asiapay', new AsiapayProvider());
        }
    }

    /**
     * verify credentials and setup providers
     */
    async init(): Promise<void> {
        const initPromises: Promise<void>[] = [];
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
    getPaymentOptions(): AvailableOption[] {
        const options: AvailableOption[] = [];
        this.providers.forEach((provider, name) => {
            options.push({
                provider: name,
                connected: true // We assume connected if initialized without error
            });
        });
        return options;
    }

    private getProvider(name?: string): PaymentProvider {
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

    async createPayment(payload: CreatePaymentPayload, providerName?: string): Promise<PaymentResponse> {
        const provider = this.getProvider(providerName);
        return provider.createPayment(payload);
    }

    async checkStatus(transactionId: string, providerName?: string): Promise<StatusResponse> {
        const provider = this.getProvider(providerName);
        return provider.checkStatus(transactionId);
    }

    async revoke(transactionId: string, providerName?: string): Promise<RevokeResponse> {
        const provider = this.getProvider(providerName);
        return provider.revoke(transactionId);
    }
}
