CREATE TABLE IF NOT EXISTS product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    reserved INT NOT NULL DEFAULT 0,
    available_stock INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 10,
    version BIGINT DEFAULT 0
);

-- Insert sample test data
INSERT INTO product (product_id, name, description, price, stock_quantity) VALUES 
(1, 'Test Product 1', 'Description for test product 1', 10.99, 100),
(2, 'Test Product 2', 'Description for test product 2', 20.99, 50);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version) VALUES 
(1, 100, 0, 100, 10, 0),
(2, 50, 0, 50, 10, 0);
