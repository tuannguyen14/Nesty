CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE OR REPLACE FUNCTION generate_category_slug()
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

CREATE OR REPLACE TRIGGER trg_category_slug
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_slug();
