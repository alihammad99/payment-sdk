export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    redirectUrl?: string;
    error?: string;
    raw?: any;
}

export interface StatusResponse {
    success: boolean;
    status: string; // 'PENDING', 'COMPLETED', 'FAILED'
    raw?: any;
}

export interface RevokeResponse {
    success: boolean;
    message?: string;
    raw?: any;
}

export interface CreatePaymentPayload {
    amount: number;
    currency: string;
    orderId?: string;
    description?: string;
    customer?: {
        email?: string;
        phone?: string;
        name?: string;
    };
    callbackUrl?: string; // Redirect URL
    webhookUrl?: string;
    metadata?: Record<string, any>;
}

export interface SDKConfig {
    providers: {
        [key: string]: any; // Provider specific config
    };
    defaultProvider?: string;
}

export interface AvailableOption {
    provider: string;
    connected: boolean;
}
