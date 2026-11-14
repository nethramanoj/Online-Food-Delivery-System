
-- QuickBite: Online Food Delivery System

-- Create our project database
CREATE DATABASE IF NOT EXISTS quickbite;

-- Select the database we want to work with
USE quickbite;

-- Check that the database was created
SHOW DATABASES;

-- Display the currently selected database
SELECT DATABASE();

-- Step 2: Create Users table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check the table structure
DESCRIBE Users;

-- Step 3: Create Restaurants table
CREATE TABLE IF NOT EXISTS Restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check the table structure
DESCRIBE Restaurants;

-- Step 4: Create MenuItems table
CREATE TABLE IF NOT EXISTS MenuItems (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id),

    CHECK (price > 0)
);

-- Check the table structure
DESCRIBE MenuItems;

-- Step 5: Create Orders table
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ) DEFAULT 'PLACED',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (restaurant_id)
        REFERENCES Restaurants(restaurant_id),

    CHECK (total_amount >= 0)
);

-- Check the table structure
DESCRIBE Orders;

-- Step 6: Create OrderItems table
CREATE TABLE IF NOT EXISTS OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (item_id) REFERENCES MenuItems(item_id),

    CHECK (quantity > 0),
    CHECK (item_price > 0)
);

-- Check the table structure
DESCRIBE OrderItems;

-- Step 7: Create Payments table
CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    payment_method ENUM('UPI', 'CARD', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')
        DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CHECK (amount > 0)
);

-- Check the table structure
DESCRIBE Payments;

-- Step 8: Create Deliveries table
CREATE TABLE IF NOT EXISTS Deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    delivery_person VARCHAR(100),
    delivery_phone VARCHAR(15),
    delivery_status ENUM(
        'ASSIGNED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'FAILED'
    ) DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- Check the table structure
DESCRIBE Deliveries;

-- INSERTING USERS--

-- Step 9: Insert sample users
INSERT INTO Users (name, email, password_hash, role)
VALUES
('Aarav Sharma', 'aarav@example.com', 'demo_hash_customer', 'CUSTOMER'),
('Priya Rao', 'priya@example.com', 'demo_hash_staff', 'STAFF'),
('Admin User', 'admin@example.com', 'demo_hash_admin', 'ADMIN');

-- Display all users
SELECT user_id, name, email, role FROM Users;

-- Step 10: Insert sample restaurants
INSERT INTO Restaurants
(name, address, cuisine_type, phone, is_open)
VALUES
('Spice Garden', 'Indiranagar, Bengaluru', 'Indian', '9876500001', TRUE),
('Pizza Corner', 'Koramangala, Bengaluru', 'Italian', '9876500002', TRUE),
('Wok Express', 'Whitefield, Bengaluru', 'Chinese', '9876500003', TRUE);

-- Display all restaurants
SELECT * FROM Restaurants;

-- Step 11: Insert sample menu items
INSERT INTO MenuItems
(restaurant_id, item_name, description, price, category, is_available)
VALUES
(1, 'Paneer Butter Masala', 'Paneer in creamy tomato gravy', 240.00, 'Main Course', TRUE),
(1, 'Veg Biryani', 'Aromatic vegetable rice', 180.00, 'Main Course', TRUE),
(1, 'Masala Dosa', 'Crispy dosa with potato filling', 100.00, 'Breakfast', TRUE),
(2, 'Margherita Pizza', 'Classic cheese pizza', 250.00, 'Pizza', TRUE),
(2, 'Farmhouse Pizza', 'Pizza with fresh vegetables', 350.00, 'Pizza', TRUE),
(2, 'Garlic Bread', 'Toasted bread with garlic butter', 120.00, 'Sides', TRUE),
(3, 'Veg Hakka Noodles', 'Stir-fried vegetable noodles', 170.00, 'Noodles', TRUE),
(3, 'Veg Fried Rice', 'Fried rice with mixed vegetables', 160.00, 'Rice', TRUE),
(3, 'Chilli Paneer', 'Paneer tossed in spicy sauce', 220.00, 'Starters', TRUE);

-- Display menu items with restaurant names
SELECT
    m.item_id,
    r.name AS restaurant,
    m.item_name,
    m.price,
    m.category
FROM MenuItems m
JOIN Restaurants r
    ON m.restaurant_id = r.restaurant_id;

-- Step 12: Insert a sample order
INSERT INTO Orders
(user_id, restaurant_id, status, total_amount)
VALUES
(1, 1, 'PLACED', 660.00);

-- Display the order with customer and restaurant names
SELECT
    o.order_id,
    u.name AS customer,
    r.name AS restaurant,
    o.status,
    o.total_amount,
    o.order_date
FROM Orders o
JOIN Users u ON o.user_id = u.user_id
JOIN Restaurants r ON o.restaurant_id = r.restaurant_id;

-- Correct the order total
UPDATE Orders
SET total_amount = 620.00
WHERE order_id = 1;

-- Add items to the order
INSERT INTO OrderItems
(order_id, item_id, quantity, item_price)
VALUES
(1, 1, 1, 240.00),
(1, 2, 1, 180.00),
(1, 3, 2, 100.00);

-- Display the order items
SELECT
    oi.order_id,
    m.item_name,
    oi.quantity,
    oi.item_price,
    (oi.quantity * oi.item_price) AS subtotal
FROM OrderItems oi
JOIN MenuItems m ON oi.item_id = m.item_id
WHERE oi.order_id = 1;

-- Insert payment information
INSERT INTO Payments
(order_id, payment_method, payment_status, amount)
VALUES
(1, 'UPI', 'SUCCESS', 620.00);

-- Display payment details
SELECT
    p.payment_id,
    p.order_id,
    u.name AS customer,
    p.payment_method,
    p.payment_status,
    p.amount
FROM Payments p
JOIN Orders o ON p.order_id = o.order_id
JOIN Users u ON o.user_id = u.user_id;

-- Insert delivery information
INSERT INTO Deliveries
(order_id, delivery_person, delivery_phone, delivery_status)
VALUES
(1, 'Rahul Kumar', '9876500010', 'ASSIGNED');

-- Display delivery details
SELECT
    d.delivery_id,
    d.order_id,
    u.name AS customer,
    d.delivery_person,
    d.delivery_status,
    d.assigned_at
FROM Deliveries d
JOIN Orders o ON d.order_id = o.order_id
JOIN Users u ON o.user_id = u.user_id;
 
-- Step 13: Create an index for customer order searches
-- Step 13: Create an index if it does not already exist
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Orders'
      AND INDEX_NAME = 'idx_orders_user_id'
);

SET @index_sql = IF(
    @index_exists = 0,
    'CREATE INDEX idx_orders_user_id ON Orders(user_id)',
    'SELECT ''Index already exists'' AS message'
);

PREPARE index_stmt FROM @index_sql;
EXECUTE index_stmt;
DEALLOCATE PREPARE index_stmt;
-- Step 14: Create a view for complete order summaries
CREATE OR REPLACE VIEW OrderSummary AS
SELECT
    o.order_id,
    u.name AS customer,
    r.name AS restaurant,
    o.total_amount,
    o.status AS order_status,
    p.payment_method,
    p.payment_status,
    d.delivery_person,
    d.delivery_status
FROM Orders o
JOIN Users u ON o.user_id = u.user_id
JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
LEFT JOIN Payments p ON o.order_id = p.order_id
LEFT JOIN Deliveries d ON o.order_id = d.order_id;

-- Step 15: Create a stored procedure to retrieve customer orders
DROP PROCEDURE IF EXISTS GetCustomerOrders;

DELIMITER //

CREATE PROCEDURE GetCustomerOrders(IN customer_id_input INT)
BEGIN
    SELECT
        o.order_id,
        u.name AS customer,
        r.name AS restaurant,
        o.total_amount,
        o.status
    FROM Orders o
    JOIN Users u ON o.user_id = u.user_id
    JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
    WHERE o.user_id = customer_id_input;
END //

DELIMITER ;

-- Step 16: Create a trigger to validate order item prices
DROP TRIGGER IF EXISTS CheckOrderItemPrice;

DELIMITER //

CREATE TRIGGER CheckOrderItemPrice
BEFORE INSERT ON OrderItems
FOR EACH ROW
BEGIN
    DECLARE actual_price DECIMAL(10,2);

    SELECT price INTO actual_price
    FROM MenuItems
    WHERE item_id = NEW.item_id;

    IF NEW.item_price <> actual_price THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Order item price does not match menu price';
    END IF;
END //

DELIMITER ;

-- Step 17: Test the view and stored procedure
SELECT * FROM OrderSummary;

CALL GetCustomerOrders(1);

-- Step 18: Verify the index and trigger
SHOW INDEX FROM Orders;

SHOW TRIGGERS;

