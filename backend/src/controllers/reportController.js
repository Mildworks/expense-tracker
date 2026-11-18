const reportModel = require("../models/reportModel");

const YEAR_PATTERN = /^\d{4}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const VALID_TYPES = ["income", "expense"];

const getMonthly = async (req, res) => {
  try {
    const year = req.query.year || String(new Date().getFullYear());

    if (!YEAR_PATTERN.test(year)) {
      return res.status(400).json({ message: "Tahun harus berformat YYYY" });
    }

    const months = await reportModel.getMonthlySummary(req.userId, year);
    res.status(200).json({ year, months });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const month = req.query.month || new Date().toLocaleDateString("en-CA").slice(0, 7);
    const type = req.query.type || "expense";

    if (!MONTH_PATTERN.test(month)) {
      return res.status(400).json({ message: "Bulan harus berformat YYYY-MM" });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "Jenis harus income atau expense" });
    }

    const categories = await reportModel.getCategoryBreakdown(req.userId, month, type);
    res.status(200).json({ month, type, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthly, getCategories };