CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Kiểm tra input không null và không rỗng
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN '';
  END IF;
  
  RETURN lower(
    trim(
      both '-' FROM  -- Loại bỏ dấu - ở đầu và cuối
      regexp_replace(
        regexp_replace(
          unaccent(trim(input_text)), -- Bỏ dấu tiếng Việt và trim
          '[^a-zA-Z0-9\s]+', '', 'g'  -- Loại bỏ ký tự đặc biệt, giữ lại chữ, số, khoảng trắng
        ),
        '\s+', '-', 'g'  -- Thay khoảng trắng bằng dấu -
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function trigger chung cho việc tạo slug
CREATE OR REPLACE FUNCTION generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Tự động tạo slug từ trường name
  NEW.slug := generate_slug(NEW.name);
  
  -- Nếu slug rỗng, tạo slug từ id (fallback)
  IF NEW.slug = '' THEN
    NEW.slug := 'item-' || COALESCE(NEW.id::TEXT, 'new');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho bảng categories
DROP TRIGGER IF EXISTS trg_category_slug ON categories;
CREATE TRIGGER trg_category_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_trigger();

-- Áp dụng trigger cho bảng products  
DROP TRIGGER IF EXISTS trg_product_slug ON products;
CREATE TRIGGER trg_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_trigger();

-- Function helper để tạo slug unique (tránh trùng lặp)
CREATE OR REPLACE FUNCTION generate_unique_slug(
  input_text TEXT,
  table_name TEXT,
  exclude_id INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  exists_check BOOLEAN;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  -- Kiểm tra slug đã tồn tại chưa
  LOOP
    EXECUTE format(
      'SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))',
      table_name
    ) USING final_slug, exclude_id INTO exists_check;
    
    IF NOT exists_check THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;