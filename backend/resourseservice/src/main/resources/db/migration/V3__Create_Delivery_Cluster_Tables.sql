-- Create delivery_clusters table
CREATE TABLE IF NOT EXISTS delivery_clusters (
    cluster_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cluster_name VARCHAR(100) NOT NULL UNIQUE,
    assigned_driver_id BIGINT,
    assignment_id BIGINT,
    total_distance DECIMAL(10, 2),
    estimated_time DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_cluster_driver FOREIGN KEY (assigned_driver_id) REFERENCES driver_profiles(driver_id),
    CONSTRAINT fk_cluster_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    INDEX idx_cluster_status (status),
    INDEX idx_cluster_driver (assigned_driver_id),
    INDEX idx_cluster_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cluster_orders table
CREATE TABLE IF NOT EXISTS cluster_orders (
    cluster_order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cluster_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    delivery_sequence INT NOT NULL,
    customer_latitude DECIMAL(10, 7),
    customer_longitude DECIMAL(10, 7),
    customer_address VARCHAR(500),
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    delivered_at TIMESTAMP NULL,
    delivery_notes VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cluster_order_cluster FOREIGN KEY (cluster_id) REFERENCES delivery_clusters(cluster_id) ON DELETE CASCADE,
    INDEX idx_cluster_order_id (order_id),
    INDEX idx_cluster_delivery_seq (cluster_id, delivery_sequence),
    INDEX idx_cluster_order_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments for documentation
ALTER TABLE delivery_clusters COMMENT = 'Stores delivery clusters created using K-means clustering';
ALTER TABLE cluster_orders COMMENT = 'Stores orders within clusters with TSP-optimized delivery sequence';

