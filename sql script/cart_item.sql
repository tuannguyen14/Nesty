CREATE TABLE
    cart_items (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES cart (user_id) ON DELETE CASCADE,
        product_variant_id INT NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        added_at TIMESTAMPTZ DEFAULT NOW ()
    );

ALTER TABLE cart_items ADD CONSTRAINT unique_cart_item UNIQUE (user_id, product_variant_id)