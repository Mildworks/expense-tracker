const pool = require("../config/db");

const COLUMNS = `id, category_id, type, amount::int AS amount, note, to_char(date, 'YYYY-MM-DD') AS date`;

const findAllByUser = async (userId, { month, type } = {}) => {
  const conditions = ["t.user_id = $1"];
  const values = [userId];

  if (month) {
    values.push(`${month}-01`);
    conditions.push(
      `t.date >= $${values.length}::date AND t.date < $${values.length}::date + INTERVAL '1 month'`
    );
  }

  if (type) {
    values.push(type);
    conditions.push(`t.type = $${values.length}`);
  }

  const result = await pool.query(
    `SELECT t.id, t.category_id, c.name AS category_name, t.type,
            t.amount::int AS amount, t.note, to_char(t.date, 'YYYY-MM-DD') AS date
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.date DESC, t.id DESC`,
    values
  );
  return result.rows;
};

const findById = async (id, userId) => {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
};

const create = async (userId, { categoryId, type, amount, note, date }) => {
  const result = await pool.query(
    `INSERT INTO transactions (user_id, category_id, type, amount, note, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [userId, categoryId, type, amount, note, date]
  );
  return result.rows[0];
};

const update = async (id, userId, { categoryId, type, amount, note, date }) => {
  const result = await pool.query(
    `UPDATE transactions
     SET category_id = $3, type = $4, amount = $5, note = $6, date = $7
     WHERE id = $1 AND user_id = $2
     RETURNING ${COLUMNS}`,
    [id, userId, categoryId, type, amount, note, date]
  );
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { findAllByUser, findById, create, update, remove };