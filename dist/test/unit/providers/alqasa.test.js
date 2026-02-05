"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alqasa_provider_1 = require("../../../src/providers/alqasa/alqasa-provider");
const alqasa_client_1 = require("../../../src/providers/alqasa/alqasa-client");
// Mock AlqasaClient
jest.mock('../../../src/providers/alqasa/alqasa-client');
describe('AlqasaProvider', () => {
    let provider;
    const config = {
        token: 'test-token'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        provider = new alqasa_provider_1.AlqasaProvider();
    });
    it('should initialize with client', async () => {
        await provider.init(config);
        expect(alqasa_client_1.AlqasaClient).toHaveBeenCalledWith('test-token');
    });
    it('should create payment successfully', async () => {
        await provider.init(config);
        const mockClientInstance = alqasa_client_1.AlqasaClient.mock.instances[0];
        mockClientInstance.createPayment.mockResolvedValue({
            payment_id: '12345',
            redirect_url: 'http://example.com'
        });
        const payload = {
            amount: 100,
            currency: 'IQD',
            description: 'Test'
        };
        const result = await provider.createPayment(payload);
        expect(mockClientInstance.createPayment).toHaveBeenCalledWith(expect.objectContaining({
            amount: 100,
            currency: 'IQD',
            description: 'Test'
        }));
        expect(result).toEqual({
            success: true,
            transactionId: '12345',
            redirectUrl: 'http://example.com',
            raw: expect.anything()
        });
    });
    it('should handle errors during payment creation', async () => {
        await provider.init(config);
        const mockClientInstance = alqasa_client_1.AlqasaClient.mock.instances[0];
        mockClientInstance.createPayment.mockRejectedValue({
            message: 'API Error'
        });
        const payload = { amount: 100, currency: 'IQD' };
        const result = await provider.createPayment(payload);
        expect(result).toEqual({
            success: false,
            error: 'API Error',
            raw: expect.anything()
        });
    });
    it('should throw error if not initialized', async () => {
        await expect(provider.createPayment({ amount: 100, currency: 'IQD' }))
            .rejects.toThrow('Alqasa provider not initialized');
    });
});
