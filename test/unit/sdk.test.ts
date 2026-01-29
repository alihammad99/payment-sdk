import { PaymentSDK } from '../../src/core/payment-sdk';
import { AlqasaProvider } from '../../src/providers/alqasa';
import { ZaincashProvider } from '../../src/providers/zaincash';

// Mock the providers
jest.mock('../../src/providers/alqasa');
jest.mock('../../src/providers/zaincash');

describe('PaymentSDK', () => {
    let sdk: PaymentSDK;
    const config = {
        providers: {
            alqasa: {
                token: 'test-token'
            },
            zaincash: {
                msisdn: '123',
                secret: 'sec',
                merchantId: 'mid',
                production: false
            }
        },
        defaultProvider: 'alqasa'
    };

    let mockAlqasaCreatePayment: jest.Mock;
    let mockZaincashCreatePayment: jest.Mock;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        mockAlqasaCreatePayment = jest.fn().mockResolvedValue({ success: true });
        mockZaincashCreatePayment = jest.fn().mockResolvedValue({ success: true });

        // Setup mock implementations
        (AlqasaProvider as jest.Mock).mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
            createPayment: mockAlqasaCreatePayment,
            checkStatus: jest.fn(),
            revoke: jest.fn(),
            name: 'alqasa'
        }));

        (ZaincashProvider as jest.Mock).mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
            createPayment: mockZaincashCreatePayment,
            checkStatus: jest.fn(),
            revoke: jest.fn(),
            name: 'zaincash'
        }));
    });

    it('should initialize successfully', async () => {
        sdk = new PaymentSDK(config);
        await sdk.init();
        expect(AlqasaProvider).toHaveBeenCalled();
        expect(ZaincashProvider).toHaveBeenCalled();
    });

    it('should get payment options', () => {
        sdk = new PaymentSDK(config);
        const options = sdk.getPaymentOptions();
        expect(options).toEqual([
            { provider: 'alqasa', connected: true },
            { provider: 'zaincash', connected: true }
        ]);
    });

    it('should create payment with default provider', async () => {
        sdk = new PaymentSDK(config);
        await sdk.init();

        const payload = { amount: 100, currency: 'USD' };
        await sdk.createPayment(payload);

        expect(mockAlqasaCreatePayment).toHaveBeenCalledWith(payload);
    });

    it('should create payment with specific provider', async () => {
        sdk = new PaymentSDK(config);
        await sdk.init();

        const payload = { amount: 100, currency: 'IQD' };
        await sdk.createPayment(payload, 'zaincash');

        expect(mockZaincashCreatePayment).toHaveBeenCalledWith(payload);
    });

    it('should throw error for unknown provider', async () => {
        sdk = new PaymentSDK(config);
        await sdk.init();

        await expect(sdk.createPayment({ amount: 100, currency: 'USD' }, 'unknown'))
            .rejects.toThrow('Provider unknown not found or not initialized');
    });
});
