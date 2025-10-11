-- Sample inventory data for integration tests
INSERT INTO inventory (id, product_id, quantity, reserved_quantity, updated_at) 
VALUES 
(201, 101, 100, 0, CURRENT_TIMESTAMP),
(202, 102, 50, 0, CURRENT_TIMESTAMP),
(203, 103, 75, 0, CURRENT_TIMESTAMP),
(204, 104, 25, 0, CURRENT_TIMESTAMP),
(205, 105, 10, 0, CURRENT_TIMESTAMP);
