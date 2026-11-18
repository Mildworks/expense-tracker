const budgetModel = require("../models/budgetModel");
const categoryModel = require("../models/categoryModel");

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const currentMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

const isValidAmount = (amount) => Number.isInteger(amount) && amount > 0;

const handleError = (res, error) => {
  if (error.code === "22P02") {
    return res.status(400).json({ message: "Id tidak valid" });
  }
  res.status(500).json({ message: error.message });
};

const getBudgets = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();

    if (!MONTH_PATTERN.test(month)) {
      return res.status(400).json({ message: "Bulan harus berformat YYYY-MM" });
    }

    const budgets = await budgetModel.findAllByUser(req.userId, month);
    res.status(200).json({ budgets });
  } catch (error) {
    handleError(res, error);
  }
};

const createBudget = async (req, res) => {
  try {
    const { categoryId, amount } = req.body;
    const month = req.body.month || currentMonth();

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ message: "Kategori wajib dipilih" });
    }
    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Jumlah harus bilangan bulat lebih dari 0" });
    }
    if (!MONTH_PATTERN.test(month)) {
      return res.status(400).json({ message: "Bulan harus berformat YYYY-MM" });
    }

    const category = await categoryModel.findById(categoryId, req.userId);
    if (!category) {
      return res.status(400).json({ message: "Kategori tidak ditemukan" });
    }
    if (category.type !== "expense") {
      return res.status(400).json({ message: "Budget hanya untuk kategori pengeluaran" });
    }

    const budget = await budgetModel.create(req.userId, { categoryId, month, amount });
    res.status(201).json({ budget });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Budget kategori ini di bulan tersebut sudah ada" });
    }
    handleError(res, error);
  }
};

const updateBudget = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: "Jumlah harus bilangan bulat lebih dari 0" });
    }

    const budget = await budgetModel.update(req.params.id, req.userId, amount);
    if (!budget) {
      return res.status(404).json({ message: "Budget tidak ditemukan" });
    }

    res.status(200).json({ budget });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteBudget = async (req, res) => {
  try {
    const deleted = await budgetModel.remove(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ message: "Budget tidak ditemukan" });
    }

    res.status(200).json({ message: "Budget dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };