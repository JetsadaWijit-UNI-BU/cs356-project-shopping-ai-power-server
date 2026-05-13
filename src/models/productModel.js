const db = require('../db');

const createProduct = async (storeId, displayName, price, pictures, description) => {
    const query = `INSERT INTO products (store_id, display_name, price, pictures, description) VALUES (?, ?, ?, ?, ?)`;
    const insertId = await db.executeInsert(query, [storeId, displayName, price, pictures, description]);
    return insertId;
};

const getProducts = async (storeId, limit, offset) => {
    // Retrieve products belonging to a specific store with pagination limits
    const query = `SELECT * FROM products WHERE store_id = ? LIMIT ? OFFSET ?`;
    return await db.executeQuery(query, [storeId, Number(limit), Number(offset)]);
};

const getProductById = async (productId) => {
    // Retrieve a single product by its ID to check permissions before edit/delete
    const query = `SELECT * FROM products WHERE id = ?`;
    const rows = await db.executeQuery(query, [productId]);
    return rows.length > 0 ? rows[0] : null;
};

const updateProduct = async (productId, displayName, price, pictures, description) => {
    // Update an existing product
    const query = `UPDATE products SET display_name = ?, price = ?, pictures = ?, description = ? WHERE id = ?`;
    return await db.executeQuery(query, [displayName, price, pictures, description, productId]);
};

const deleteProduct = async (productId) => {
    // Delete a product from the database
    const query = `DELETE FROM products WHERE id = ?`;
    return await db.executeQuery(query, [productId]);
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
