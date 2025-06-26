CREATE TABLE
    orders (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (
            status IN (
                'pending',
                'processing',
                'shipped',
                'completed',
                'cancelled'
            )
        ),
        total_amount NUMERIC(10, 2),
        voucher_id INT REFERENCES vouchers (id),
        voucher_discount NUMERIC(10, 2),
        shipping_name TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_phone TEXT,
        shipping_code TEXT, -- Mã vận chuyển
        shipping_provider TEXT, -- Tên đơn vị vận chuyển (VNPost, Giao Hàng Nhanh, v.v.)
        created_at TIMESTAMPTZ DEFAULT NOW (),
        order_code TEXT UNIQUE
        updated_at TIMESTAMPTZ DEFAULT NOW (),
    );