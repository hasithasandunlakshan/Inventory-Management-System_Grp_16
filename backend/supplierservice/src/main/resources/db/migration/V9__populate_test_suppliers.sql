-- Insert sample categories if they don't exist
INSERT IGNORE INTO supplier_categories (name) VALUES 
('Electronics'),
('Clothing'),
('Food & Beverages'),
('Books & Media'),
('Home & Garden');

-- Insert some test suppliers (using the category IDs)
INSERT INTO suppliers (name, contact_info, category_id) VALUES
('TechSupply Co.', 'tech@techsupply.com', 1),
('Fashion Forward Inc.', 'orders@fashionforward.com', 2),
('Fresh Foods Ltd.', 'sales@freshfoods.com', 3),
('BookWorld Distribution', 'wholesale@bookworld.com', 4),
('Garden Paradise', 'info@gardenparadise.com', 5);
