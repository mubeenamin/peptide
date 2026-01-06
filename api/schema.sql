-- Database Schema for Peptide Sciences Clone (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer', -- customer, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    size VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    category VARCHAR(100),
    
    -- Chemical Details
    cas_number VARCHAR(100),
    formula VARCHAR(100),
    molecular_weight VARCHAR(100),
    purity VARCHAR(100),
    pubchem_cid VARCHAR(100),
    synonyms TEXT,
    sequence TEXT,
    
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, cancelled
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);
