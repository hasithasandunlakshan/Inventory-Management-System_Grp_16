-- ============================================
-- Performance Optimization Indexes
-- For /api/orders/user/{userId} endpoint
-- ============================================

-- This script adds indexes to improve query performance
-- Run this on your production database during a maintenance window

-- 1. Index on customer_id for faster order lookup by user
-- This is the PRIMARY optimization for the /api/orders/user/{userId} endpoint
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- 2. Index on order_id in order_items for faster joins with orders
-- Improves performance when fetching order items for each order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 3. Index on product_id in order_items for faster product lookups
-- Helps with the bulk product fetching optimization
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 4. Composite index for orders by customer and status
-- Useful if you filter by status in future implementations
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);

-- 5. Index on order_date for sorting
-- Improves performance when orders need to be sorted by date
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);

-- 6. Index on status for filtering orders by status
-- Useful for admin queries and filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 7. Composite index on updated_at and status
-- Useful for tracking recent order changes
CREATE INDEX IF NOT EXISTS idx_orders_updated_status ON orders(updated_at DESC, status);

-- ============================================
-- How to verify indexes were created:
-- ============================================

-- For MySQL:
-- SHOW INDEX FROM orders;
-- SHOW INDEX FROM order_items;

-- For PostgreSQL:
-- SELECT * FROM pg_indexes WHERE tablename = 'orders';
-- SELECT * FROM pg_indexes WHERE tablename = 'order_items';

-- ============================================
-- Performance Monitoring Queries:
-- ============================================

-- Check query execution plan for the main query (MySQL):
-- EXPLAIN SELECT o.* FROM orders o WHERE o.customer_id = 1;

-- Check query execution plan for the main query (PostgreSQL):
-- EXPLAIN ANALYZE SELECT o.* FROM orders o WHERE o.customer_id = 1;

-- ============================================
-- Rollback (if needed):
-- ============================================

-- DROP INDEX idx_orders_customer_id ON orders;
-- DROP INDEX idx_order_items_order_id ON order_items;
-- DROP INDEX idx_order_items_product_id ON order_items;
-- DROP INDEX idx_orders_customer_status ON orders;
-- DROP INDEX idx_orders_date ON orders;
-- DROP INDEX idx_orders_status ON orders;
-- DROP INDEX idx_orders_updated_status ON orders;
