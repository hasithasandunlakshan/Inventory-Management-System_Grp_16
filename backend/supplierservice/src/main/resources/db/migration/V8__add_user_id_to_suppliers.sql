-- Add user_id column to suppliers table to link suppliers to users
ALTER TABLE suppliers 
ADD COLUMN user_id BIGINT,
ADD CONSTRAINT fk_suppliers_user 
  FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX idx_suppliers_user ON suppliers(user_id);

-- Update existing suppliers with dummy user IDs if needed
-- This is a placeholder - you may need to manually map existing suppliers to users
-- UPDATE suppliers SET user_id = 1 WHERE user_id IS NULL;
