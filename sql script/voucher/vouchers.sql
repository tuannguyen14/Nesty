CREATE TABLE
    vouchers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(30) UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
        discount_value NUMERIC(10, 2) NOT NULL,
        min_order_value NUMERIC(10, 2),
        max_discount NUMERIC(10, 2),
        quantity INT,
        valid_from TIMESTAMPTZ,
        valid_to TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW ()
    );

ALTER TABLE vouchers ADD CONSTRAINT check_voucher_dates CHECK (
    valid_from IS NULL
    OR valid_to IS NULL
    OR valid_from <= valid_to
);