const pool = require("../config/db");

const COLUMNS = `id, category_id, to_char(month, 'YYYY-MM') AS month, amount::int AS amount`;

const findAllByUser = async (userId, month) => {
  const result = await pool.query(
    `SELECT b.id, b.category_id, c.name AS category_name,
            to_char(b.month, 'YYYY-MM') AS month,
            b.amount::int AS amount,
            COALESCE((
              SELECT SUM(t.amount)
              FROM transactions t
              WHERE t.user_id = b.user_id
                AND t.category_id = b.category_id
                AND t.date >= b.month
                AND t.date < b.month + INTERVAL '1 month'
            ), 0)::int AS spent
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.user_id = $1 AND b.month = $2::date
     ORDER BY c.name`,
    [userId, `${month}-01`]
  );
  return result.rows;
};

const create = async (userId, { categoryId, month, amount }) => {
  const result = await pool.query(
    `INSERT INTO budgets (user_id, category_id, month, amount)
     VALUES ($1, $2, $3::date, $4)
     RETURNING ${COLUMNS}`,
    [userId, categoryId, `${month}-01`, amount]
  );
  return result.rows[0];
};

const update = async (id, userId, amount) => {
  const result = await pool.query(
    `UPDATE budgets SET amount = $3
     WHERE id = $1 AND user_id = $2
     RETURNING ${COLUMNS}`,
    [id, userId, amount]
  );
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await pool.query(
    "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { findAllByUser, create, update, remove };