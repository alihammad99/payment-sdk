export interface AsiapayConfig {
    appId: string;
    appSecret: string;
    appKey: string; // Used in headers sometimes or just config
    merchCode: string;
    privateKey: string; // For JWT signing
    production?: boolean;
}

export interface AsiapayCreateOrderBody {
    biz_content: {
        appid: string;
        merch_code: string;
        merch_order_id: string;
        total_amount: string;
        trans_currency: string;
        trade_type: string; // 'Checkout'
        title: string;
        redirect_url: string;
        notify_url: string;
        timeout_express: string;
        business_type: string; // 'BuyGoods'
    };
    method: string; // 'payment.preorder'
    nonce_str: string;
    sign_type: string; // 'JWTSecret'
    timestamp: string;
    version: string; // '1.0'
    sign?: string; // JWT signature
}
