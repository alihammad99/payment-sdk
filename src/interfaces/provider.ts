import { CreatePaymentPayload, PaymentResponse, StatusResponse, RevokeResponse } from '../types';

export interface PaymentProvider {
    name: string;

    /**
     * Initialize the provider with credentials
     */
    init(config: any): Promise<void>;

    /**
     * Create a new payment transaction
     */
    createPayment(payload: CreatePaymentPayload): Promise<PaymentResponse>;

    /**
     * Check the status of a transaction
     */
    checkStatus(transactionId: string): Promise<StatusResponse>;

    /**
     * Revoke/Refund a transaction (if supported)
     */
    revoke(transactionId: string): Promise<RevokeResponse>;
}
