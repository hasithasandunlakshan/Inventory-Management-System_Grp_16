-- Clean existing data
DELETE FROM delivery_logs;
DELETE FROM purchase_order_items;
DELETE FROM po_notes;
DELETE FROM po_audit_entries;
DELETE FROM po_attachments;
DELETE FROM purchase_orders;
DELETE FROM suppliers;
DELETE FROM supplier_categories;
DELETE FROM users;

-- Insert test users with all required fields
INSERT INTO users (username, email, full_name, password_hash, phone_number, email_verified, account_status) VALUES
('testuser1', 'test1@example.com', 'Test User 1', '$2a$10$xK3fxk4T0YRX.qKf8pNRqu1d/M3OcDG7vlzl4nyYgHykXEpQzHE/S', '1234567890', true, 'ACTIVE'),
('testuser2', 'test2@example.com', 'Test User 2', '$2a$10$xK3fxk4T0YRX.qKf8pNRqu1d/M3OcDG7vlzl4nyYgHykXEpQzHE/S', '0987654321', true, 'ACTIVE');

-- Insert supplier categories
INSERT INTO supplier_categories (name) VALUES 
('Electronics'),
('Office Supplies'),
('Furniture');

-- Insert suppliers
INSERT INTO suppliers (user_id, category_id)
SELECT u.user_id, sc.category_id
FROM users u, supplier_categories sc
WHERE u.email = 'test1@example.com' AND sc.name = 'Electronics';

INSERT INTO suppliers (user_id, category_id)
SELECT u.user_id, sc.category_id
FROM users u, supplier_categories sc
WHERE u.email = 'test2@example.com' AND sc.name = 'Office Supplies';

-- Insert purchase orders
INSERT INTO purchase_orders (supplier_id, date, status)
SELECT s.supplier_id, CURRENT_DATE(), 'DRAFT' 
FROM suppliers s
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test1@example.com';

INSERT INTO purchase_orders (supplier_id, date, status)
SELECT s.supplier_id, CURRENT_DATE(), 'SENT' 
FROM suppliers s
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test2@example.com';

-- Insert purchase order items
INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price)
SELECT po.po_id, 101, 5, 10.99
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.supplier_id
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test1@example.com';

INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price)
SELECT po.po_id, 102, 10, 5.99
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.supplier_id
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test2@example.com';

-- Insert purchase order notes
INSERT INTO po_notes (po_id, text, created_at, created_by)
SELECT po.po_id, 'Test note for purchase order', CURRENT_TIMESTAMP(), 'test_user'
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.supplier_id
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test1@example.com';

-- Insert delivery logs
INSERT INTO delivery_logs (po_id, item_id, received_quantity, received_date)
SELECT po.po_id, 101, 3, CURRENT_DATE()
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.supplier_id
JOIN users u ON s.user_id = u.user_id
WHERE u.email = 'test1@example.com';
