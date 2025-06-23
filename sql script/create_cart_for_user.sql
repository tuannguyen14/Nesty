CREATE OR REPLACE FUNCTION create_cart_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cart(user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_cart
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_cart_for_user();
