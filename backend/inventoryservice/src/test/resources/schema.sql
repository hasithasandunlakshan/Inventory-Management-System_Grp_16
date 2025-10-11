CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Insert sample test data
INSERT INTO product (id, name, description, price, stock_quantity) VALUES 
(1, 'Test Product 1', 'Description for test product 1', 10.99, 100),
(2, 'Test Product 2', 'Description for test product 2', 20.99, 50);

INSERT INTO inventory (product_id, quantity, reserved_quantity) VALUES 
(1, 100, 0),
(2, 50, 0);
