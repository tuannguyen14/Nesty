CREATE TABLE
    product_variants (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
        color TEXT,
        size TEXT,
        price_override NUMERIC(10, 2),
        stock INT DEFAULT 0,
        sku TEXT UNIQUE
    );

ALTER TABLE product_variants ADD CONSTRAINT unique_product_variant UNIQUE (product_id, color, size);
ALTER TABLE product_variants ADD CONSTRAINT check_stock CHECK (stock >= 0);