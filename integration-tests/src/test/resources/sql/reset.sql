-- Reset database for integration tests
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE orders;
TRUNCATE TABLE order_items;
TRUNCATE TABLE products;
TRUNCATE TABLE inventory;
TRUNCATE TABLE payments;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert test user
INSERT INTO users (id, email, name, password, role) 
VALUES (1, 'test@example.com', 'Test User', '$2a$10$abcdefghijklmnopqrstuvwxyz', 'USER');
