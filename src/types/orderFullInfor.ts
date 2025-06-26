export interface Order {
    id: number // SERIAL PRIMARY KEY trong SQL = number
    user_id: string // UUID
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
    total_amount: number
    voucher_id: number | null // INT REFERENCES vouchers(id)
    voucher_discount: number | null // NUMERIC(10, 2) từ schema
    shipping_name: string // TEXT NOT NULL từ schema
    shipping_address: string // TEXT NOT NULL
    shipping_phone: string | null // TEXT (nullable)
    shipping_code: string | null // TEXT - Mã vận chuyển
    shipping_provider: string | null // TEXT - Tên đơn vị vận chuyển
    created_at: string
    order_code: string // TEXT UNIQUE
    note: string
    updated_at: string
    discount_amount: number
    users: {
        full_name: string | null
        email: string
    }
    vouchers: {
        code: string
        discount_type: 'percent' | 'fixed'
        discount_value: number
    } | null
    order_items: {
        id: number // SERIAL PRIMARY KEY
        quantity: number
        price: number
        product_variants: {
            id: number
            sku: string | null
            color: string | null
            size: string | null
            products: {
                name: string
                product_images: {
                    image_url: string
                    sort_order: number
                }[]
            }
        }
    }[]
}