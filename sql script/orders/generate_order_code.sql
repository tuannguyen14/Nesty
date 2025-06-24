CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_date_str TEXT;
    sequence_num INT;
    order_code TEXT;
    max_attempts INT := 10;
    attempt INT := 0;
BEGIN
    current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    
    LOOP
        -- Đếm số order trong ngày và tăng thêm 1
        SELECT COALESCE(COUNT(*), 0) + 1 + attempt
        INTO sequence_num
        FROM orders 
        WHERE order_code LIKE 'ODR-' || current_date_str || '-%';
        
        -- Tạo order_code
        order_code := 'ODR-' || current_date_str || '-' || LPAD(sequence_num::TEXT, 5, '0');
        
        -- Kiểm tra xem code đã tồn tại chưa
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = order_code) THEN
            RETURN order_code;
        END IF;
        
        attempt := attempt + 1;
        EXIT WHEN attempt >= max_attempts;
    END LOOP;
    
    -- Fallback với timestamp nếu không tạo được
    RETURN 'ODR-' || current_date_str || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000::TEXT, 5, '0');
END;
$$;