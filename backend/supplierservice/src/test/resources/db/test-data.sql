-- Insert test data into users
INSERT INTO users (user_id, username, email, full_name, password_hash) VALUES
(1, 'testuser1', 'test1@example.com', 'Test User 1', 'hashedpassword1'),
(2, 'testuser2', 'test2@example.com', 'Test User 2', 'hashedpassword2');

-- Insert test data into supplier_categories
INSERT INTO supplier_categories (category_id, name) VALUES 
(1, 'Electronics'),
(2, 'Office Supplies'),
(3, 'Furniture');

-- Insert test data into suppliers
INSERT INTO suppliers (supplier_id, user_id, category_id) VALUES 
(1, 1, 1),
(2, 2, 2);
