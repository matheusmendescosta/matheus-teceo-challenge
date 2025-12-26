-- Adicionar índices para otimizar queries de join

-- Índices em OrderItems
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku_id ON order_items(sku_id);
CREATE INDEX idx_order_items_order_sku ON order_items(order_id, sku_id);

-- Índices em SKUs
CREATE INDEX idx_skus_product_color_id ON skus(product_color_id);
CREATE INDEX idx_skus_product_size_id ON skus(product_size_id);

-- Índices em Orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Índices em Customers
CREATE INDEX idx_customers_email ON customers(email);