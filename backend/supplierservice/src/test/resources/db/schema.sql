-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    password_hash VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20),
    formatted_address TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    date_of_birth DATE,
    profile_image_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Supplier Categories table
CREATE TABLE IF NOT EXISTS supplier_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES supplier_categories(category_id)
);
