-- Create notification_db database if it doesn't exist
CREATE DATABASE IF NOT EXISTS notification_db;
USE notification_db;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_user_type (user_id, type)
);

-- Insert some sample data for testing
INSERT INTO notifications (user_id, message, type, metadata) VALUES 
('user123', 'Welcome to the notification service!', 'SYSTEM', '{"source":"system"}'),
('user123', 'Your order #ORDER-001 has been placed successfully', 'ORDER', '{"orderId":"ORDER-001","amount":99.99}'),
('user456', 'Low stock alert for Product XYZ', 'INVENTORY', '{"productId":"XYZ","currentStock":5}');

-- Show the structure and sample data
DESCRIBE notifications;
SELECT * FROM notifications;
