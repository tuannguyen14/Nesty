CREATE TABLE
    products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        discount_price NUMERIC(10, 2),
        discount_start TIMESTAMPTZ,
        discount_end TIMESTAMPTZ,
        category_id INT REFERENCES categories (id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW ()
    );


CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(
    trim(
      regexp_replace(
        unaccent(NEW.name), -- Bỏ dấu tiếng Việt
        '[^a-z0-9]+', '-', 'g'
      ), 
      '-'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_slug BEFORE INSERT
OR
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION generate_product_slug ();