CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    trim(
      regexp_replace(
        regexp_replace(input_text, '[àáạảãâầấậẩẫăằắặẳẵ]', 'a', 'gi'),
        '[^a-z0-9]+', '-', 'g'
      ), 
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql;