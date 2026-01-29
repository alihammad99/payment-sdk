export interface AlqasaConfig {
    token?: string;
    clientId?: string;
    clientSecret?: string;
}

export interface AlqasaCreatePaymentBody {
    amount: number;
    description: string;
    client_name: string;
    client_phone: string;
    client_email: string;
    order_id: string;
    currency: string;
    redirect_url: string;
    webhook_url: string;
    transaction_type?: string;
    custom_data?: Record<string, any>;
}

// Response types from API could also go here
export interface AlqasaPaymentResponse {
    payment_id: string;
    redirect_url: string;
    // ...
}
