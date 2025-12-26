-- Remover índices (rollback)

DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_sku_id;
DROP INDEX IF EXISTS idx_order_items_order_sku;
DROP INDEX IF EXISTS idx_skus_product_color_id;
DROP INDEX IF EXISTS idx_skus_product_size_id;
DROP INDEX IF EXISTS idx_orders_customer_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_customers_email;