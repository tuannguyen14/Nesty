CREATE OR REPLACE FUNCTION handle_order_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Tự động tạo order_code nếu chưa có
    IF NEW.order_code IS NULL THEN
        NEW.order_code := generate_order_code();
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. Create trigger
DROP TRIGGER IF EXISTS set_order_code_trigger ON orders;
CREATE TRIGGER set_order_code_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_code();

-- 4. Enable RLS và tạo policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user xem orders của chính họ
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policy cho phép user tạo order mới
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy cho phép user update orders của chính họ (nếu cần)
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. RLS cho order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy cho order_items
DROP POLICY IF EXISTS "Users can manage their order items" ON order_items;
CREATE POLICY "Users can manage their order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );