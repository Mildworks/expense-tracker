const pool = require("../config/db");

const findAllByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name",
    [userId]
  );
  return result.rows;
};

const findById = async (id, userId) => {
  const result = await pool.query(
    "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return result.rows[0];
};

const create = async (userId, name, type) => {
  const result = await pool.query(
    "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *",
    [userId, name, type]
  );
  return result.rows[0];
};

const update = async (id, userId, name, type) => {
  const result = await pool.query(
    "UPDATE categories SET name = $3, type = $4 WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId, name, type]
  );
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { findAllByUser, findById, create, update, remove };