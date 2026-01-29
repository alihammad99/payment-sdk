import { PaymentSDK } from '../src/index';

const config = {
    providers: {
        alqasa: {
            // Test Credentials
            clientId: 'public_test',
            clientSecret: 'Lr10yWWmm1dXLoI7VgXCrQVnlq13c1G0',
            token: 'Lr10yWWmm1dXLoI7VgXCrQVnlq13c1G0' // Assuming secret acts as token for now or simpler auth
        },
        zaincash: {
            msisdn: '9647835077893',
            secret: 'j4DpXgzopEdBrjSlRhYvDAJmtaF9nykZ',
            merchantId: '4216d9797f834f728979a5df5f548e16',
            production: false
        },
        stripe: {
            secretKey: 'sk_test_PLACEHOLDER' // Provide valid test key to run actual test
        },
        asiapay: {
            appId: '1170344370329602',
            appSecret: 'test_secret',
            appKey: 'test_key',
            merchCode: '260224',
            privateKey: 'test_private_key_jwt'
        }
    },
    defaultProvider: 'alqasa'
};

async function runTests() {
    console.log('initializing SDK...');
    const sdk = new PaymentSDK(config);

    try {
        await sdk.init();
        console.log('SDK Initialized successfully.');
    } catch (err) {
        console.error('SDK Initialization failed:', err);
    }

    const options = sdk.getPaymentOptions();
    console.log('Available Payment Options:', options);

    // Test Alqasa
    console.log('\n--- Testing Alqasa ---');
    try {
        const response = await sdk.createPayment({
            amount: 1000,
            currency: 'IQD',
            description: 'Test Payment Alqasa',
            customer: {
                name: 'Ali Hammad',
                email: 'ali@example.com'
            },
            callbackUrl: 'https://example.com/callback'
        }, 'alqasa');
        console.log('Create Payment Response:', response);
    } catch (err) {
        console.error('Alqasa Payment Failed:', err);
    }

    // Test Zaincash
    console.log('\n--- Testing Zaincash ---');
    try {
        const response = await sdk.createPayment({
            amount: 1000,
            currency: 'IQD',
            description: 'Test Payment Zaincash',
            orderId: `test-${Date.now()}`,
            callbackUrl: 'https://example.com/callback'
        }, 'zaincash');
        console.log('Create Payment Response:', response);
    } catch (err: any) {
        console.error('Zaincash Payment Failed:', err.message);
    }

    // Test Stripe
    console.log('\n--- Testing Stripe ---');
    try {
        const response = await sdk.createPayment({
            amount: 2000,
            currency: 'USD',
            description: 'Test Payment Stripe',
            orderId: `order-${Date.now()}`,
            callbackUrl: 'https://example.com/callback',
            customer: {
                email: 'customer@example.com'
            }
        }, 'stripe');
        console.log('Create Payment Response:', response);
    } catch (err: any) {
        console.error('Stripe Payment Failed:', err.message);
    }

    // Test Asiapay
    console.log('\n--- Testing Asiapay ---');
    try {
        const response = await sdk.createPayment({
            amount: 1500,
            currency: 'IQD',
            description: 'Test Payment Asiapay',
            orderId: `asia-${Date.now()}`,
            callbackUrl: 'https://example.com/callback'
        }, 'asiapay');
        console.log('Create Payment Response:', response);
    } catch (err: any) {
        console.error('Asiapay Payment Failed:', err.message);
    }
}

runTests();
