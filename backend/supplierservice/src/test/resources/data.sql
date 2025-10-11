-- Drop and recreate tables for clean test data
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS supplier_categories;

-- Create Supplier Categories table
CREATE TABLE supplier_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES supplier_categories(category_id)
);

-- Insert test data into supplier_categories
INSERT INTO supplier_categories (name) VALUES 
('Electronics'),
('Office Supplies'),
('Furniture');

-- Insert test data into users
UPDATE users SET username = 'test.user.1', full_name = 'Test User 1' WHERE user_id = 1;
UPDATE users SET username = 'test.user.2', full_name = 'Test User 2' WHERE user_id = 2;

-- Insert test data into suppliers
INSERT INTO suppliers (user_id, category_id) VALUES 
(1, 1),
(2, 2);
