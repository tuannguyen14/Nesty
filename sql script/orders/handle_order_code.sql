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

DROP TRIGGER IF EXISTS set_order_code_trigger ON orders;

CREATE TRIGGER set_order_code_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_code();

-- Cho phép user đọc order_code của chính họ
CREATE POLICY "Users can view their own order codes" ON orders
    FOR SELECT USING (auth.uid() = user_id);