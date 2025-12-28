/* Replace with your SQL commands */
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_product_colors_color_id ON product_colors(color_id);
CREATE INDEX idx_skus_product_color_price ON skus(product_color_id, price);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_product_colors_created_at ON product_colors(created_at);