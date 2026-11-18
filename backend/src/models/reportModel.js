const pool = require("../config/db");

const getMonthlySummary = async (userId, year) => {
  const result = await pool.query(
    `SELECT to_char(m, 'YYYY-MM') AS month,
            COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0)::int AS income,
            COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0)::int AS expense
     FROM generate_series($2::timestamp, $2::timestamp + INTERVAL '11 months', INTERVAL '1 month') AS m
     LEFT JOIN transactions t
       ON t.user_id = $1
      AND t.date >= m
      AND t.date < m + INTERVAL '1 month'
     GROUP BY m
     ORDER BY m`,
    [userId, `${year}-01-01`]
  );
  return result.rows;
};

const getCategoryBreakdown = async (userId, month, type) => {
  const result = await pool.query(
    `SELECT c.id AS category_id, c.name AS category_name, SUM(t.amount)::int AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.type = $3
       AND t.date >= $2::date
       AND t.date < $2::date + INTERVAL '1 month'
     GROUP BY c.id, c.name
     ORDER BY total DESC`,
    [userId, `${month}-01`, type]
  );
  return result.rows;
};

module.exports = { getMonthlySummary, getCategoryBreakdown };