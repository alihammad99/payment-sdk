export interface ZaincashConfig {
    msisdn: string;
    merchantId: string;
    secret: string;
    production?: boolean;
    token?: string; // If pre-generated
}

export interface ZaincashInitBody {
    amount: number;
    currency: string;
    // ...
}
