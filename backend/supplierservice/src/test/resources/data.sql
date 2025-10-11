-- Create Supplier Categories table
CREATE TABLE IF NOT EXISTS supplier_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES supplier_categories(category_id)
);

-- Insert test data into supplier_categories
INSERT INTO supplier_categories (category_id, name) VALUES 
(1, 'Electronics'),
(2, 'Office Supplies'),
(3, 'Furniture');

-- Insert test data into suppliers
INSERT INTO suppliers (supplier_id, name, email, phone, address, category_id) VALUES 
(1, 'Test Electronics Ltd', 'contact@testelectronics.com', '1234567890', '123 Test Street', 1),
(2, 'Office Supplies Co', 'info@officesupplies.com', '0987654321', '456 Supply Avenue', 2);
