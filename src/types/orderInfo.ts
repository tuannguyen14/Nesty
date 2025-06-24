export interface OrderInfo {
    id: number;
    order_code: string;
    user_id: string;
    status: string;
    total_amount: number;
    voucher_discount?: number;
    shipping_name: string;
    shipping_address: string;
    shipping_phone?: string;
    shipping_code?: string;
    shipping_provider?: string;
    created_at: string;
}
