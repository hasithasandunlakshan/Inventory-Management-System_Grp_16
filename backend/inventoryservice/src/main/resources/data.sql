-- Seed initial inventory rows if they don't already exist
INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 1, 100, 0, 100, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 1);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 2, 80, 0, 80, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 2);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 3, 50, 5, 45, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 3);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 4, 25, 0, 25, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 4);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 5, 10, 0, 10, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 5);

INSERT INTO inventory (product_id, stock, reserved, available_stock, min_threshold, version)
SELECT 67, 0, 0, 0, 10, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = 67);


