"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_sdk_1 = require("../../src/core/payment-sdk");
const alqasa_1 = require("../../src/providers/alqasa");
const zaincash_1 = require("../../src/providers/zaincash");
// Mock the providers
jest.mock('../../src/providers/alqasa');
jest.mock('../../src/providers/zaincash');
describe('PaymentSDK', () => {
    let sdk;
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
    let mockAlqasaCreatePayment;
    let mockZaincashCreatePayment;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        mockAlqasaCreatePayment = jest.fn().mockResolvedValue({ success: true });
        mockZaincashCreatePayment = jest.fn().mockResolvedValue({ success: true });
        // Setup mock implementations
        alqasa_1.AlqasaProvider.mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
            createPayment: mockAlqasaCreatePayment,
            checkStatus: jest.fn(),
            revoke: jest.fn(),
            name: 'alqasa'
        }));
        zaincash_1.ZaincashProvider.mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
            createPayment: mockZaincashCreatePayment,
            checkStatus: jest.fn(),
            revoke: jest.fn(),
            name: 'zaincash'
        }));
    });
    it('should initialize successfully', async () => {
        sdk = new payment_sdk_1.PaymentSDK(config);
        await sdk.init();
        expect(alqasa_1.AlqasaProvider).toHaveBeenCalled();
        expect(zaincash_1.ZaincashProvider).toHaveBeenCalled();
    });
    it('should get payment options', () => {
        sdk = new payment_sdk_1.PaymentSDK(config);
        const options = sdk.getPaymentOptions();
        expect(options).toEqual([
            { provider: 'alqasa', connected: true },
            { provider: 'zaincash', connected: true }
        ]);
    });
    it('should create payment with default provider', async () => {
        sdk = new payment_sdk_1.PaymentSDK(config);
        await sdk.init();
        const payload = { amount: 100, currency: 'USD' };
        await sdk.createPayment(payload);
        expect(mockAlqasaCreatePayment).toHaveBeenCalledWith(payload);
    });
    it('should create payment with specific provider', async () => {
        sdk = new payment_sdk_1.PaymentSDK(config);
        await sdk.init();
        const payload = { amount: 100, currency: 'IQD' };
        await sdk.createPayment(payload, 'zaincash');
        expect(mockZaincashCreatePayment).toHaveBeenCalledWith(payload);
    });
    it('should throw error for unknown provider', async () => {
        sdk = new payment_sdk_1.PaymentSDK(config);
        await sdk.init();
        await expect(sdk.createPayment({ amount: 100, currency: 'USD' }, 'unknown'))
            .rejects.toThrow('Provider unknown not found or not initialized');
    });
});
