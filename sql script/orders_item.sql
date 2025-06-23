
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id INT NOT NULL REFERENCES product_variants(id),
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);