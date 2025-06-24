-- Bước 1: Tạo permissions và policies
-- Thiết lập permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.cart TO authenticated;

-- Thiết lập RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Bước 2: Tạo policies
-- Xóa policies cũ nếu có
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Users can access own cart" ON public.cart;

-- Tạo policies cho users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tạo policies cho cart table
CREATE POLICY "Users can access own cart" ON public.cart
    FOR ALL USING (auth.uid() = user_id);

-- Bước 3: Tạo dữ liệu cho users đã tồn tại
-- Tạo user profiles cho những user đã tồn tại
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1)
    ) as full_name,
    'user' as role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id  
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Tạo cart cho những user chưa có cart
INSERT INTO public.cart (user_id)
SELECT pu.id 
FROM public.users pu
LEFT JOIN public.cart c ON pu.id = c.user_id
WHERE c.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Bước 4: Kiểm tra kết quả
-- Kiểm tra triggers đã được tạo
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated', 'trg_ensure_user_cart');

-- Kiểm tra functions
SELECT proname FROM pg_proc 
WHERE proname IN ('handle_new_user', 'handle_user_update', 'ensure_user_cart');

-- Test dữ liệu hiện tại
SELECT 
    au.id, au.email,
    pu.full_name, pu.role,
    CASE WHEN c.user_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_cart
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.cart c ON au.id = c.user_id;


-- Xóa tất cả triggers và functions cũ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS trg_ensure_user_cart ON users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_user_update();
DROP FUNCTION IF EXISTS ensure_user_cart();

-- Function xử lý khi có user mới từ Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Extract full name từ metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Tạo user profile trong public.users
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, 'user')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name);
    
    -- Tạo cart cho user
    INSERT INTO public.cart (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function xử lý khi user được update
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Extract full name từ metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Cập nhật thông tin user
    UPDATE public.users
    SET 
        email = NEW.email,
        full_name = user_name
    WHERE id = NEW.id;
    
    -- Nếu user không tồn tại, tạo mới
    IF NOT FOUND THEN
        INSERT INTO public.users (id, email, full_name, role)
        VALUES (NEW.id, NEW.email, user_name, 'user');
        
        -- Tạo cart nếu chưa có
        INSERT INTO public.cart (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để đảm bảo mọi user đều có cart
CREATE OR REPLACE FUNCTION ensure_user_cart()
RETURNS TRIGGER AS $$
BEGIN
    -- Tạo cart cho user mới
    INSERT INTO public.cart (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_update();

-- Trigger để tạo cart khi có user mới trong public.users (backup)
CREATE TRIGGER trg_ensure_user_cart
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_cart();