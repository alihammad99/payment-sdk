# Payment SDK

Unified Payment SDK for integrating multiple payment providers like Alqasa, ZainCash, Stripe, and AsiaPay into your Node.js application.

## Features

-   **Unified Interface**: Consistent patterns for different providers.
-   **Multiple Providers**: Support for Alqasa, ZainCash, and more.
-   **TypeScript Support**: Built with TypeScript for type safety and easy development.
-   **Easy Integration**: Simple configuration and method calls.

## Installation

```bash
npm install iq-payment-sdk
```

## Usage

### Alqasa Provider

```typescript
import { AlqasaClient } from 'iq-payment-sdk';

// Initialize with token
const client = new AlqasaClient('YOUR_API_TOKEN');

// OR Initialize with Client ID and Secret
// const client = new AlqasaClient({
//   clientId: 'YOUR_CLIENT_ID',
//   clientSecret: 'YOUR_CLIENT_SECRET'
// });

async function createPayment() {
  try {
    const payment = await client.createPayment({
      amount: 1000,
      currency: 'IQD',
      orderId: 'ORDER_123',
      // ... other required fields
    });
    console.log('Payment created:', payment);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### ZainCash Provider

```typescript
import { ZaincashClient } from 'iq-payment-sdk';

const client = new ZaincashClient({
  production: false, // Set to true for production
  token: 'YOUR_JWT_TOKEN',
  merchantId: 'YOUR_MERCHANT_ID',
  secret: 'YOUR_SECRET'
});

async function initTransaction() {
  try {
    const response = await client.initTransaction({
      amount: 1000,
      serviceType: 'Check',
      msisdn: '9647800000000',
      orderId: 'ORDER_456',
      redirectUrl: 'https://your-site.com/callback'
    });
    console.log('Transaction initialized:', response);
  } catch (error) {
    console.error('ZainCash Error:', error);
  }
}
```

## Supported Providers

-   **Alqasa**: Credit card and local payment methods.
-   **ZainCash**: Mobile wallet payments.
-   **Stripe**: International card payments.
-   **AsiaPay**: Asian market payment solutions.

## License

ISC
