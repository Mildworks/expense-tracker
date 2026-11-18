const transactionModel = require("../models/transactionModel");
const categoryModel = require("../models/categoryModel");

const VALID_TYPES = ["income", "expense"];

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const parseInput = async (body, userId) => {
  const { categoryId, amount, note } = body;
  const date = body.date || new Date().toLocaleDateString("en-CA");

  if (!Number.isInteger(categoryId)) {
    return { error: "Kategori wajib dipilih" };
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Jumlah harus bilangan bulat lebih dari 0" };
  }
  if (!isValidDate(date)) {
    return { error: "Tanggal harus berformat YYYY-MM-DD" };
  }

  const category = await categoryModel.findById(categoryId, userId);
  if (!category) {
    return { error: "Kategori tidak ditemukan" };
  }

  return {
    data: {
      categoryId: category.id,
      type: category.type,
      amount,
      note: note ? String(note).trim() : null,
      date,
    },
  };
};

const handleError = (res, error) => {
  if (error.code === "22P02") {
    return res.status(400).json({ message: "Id tidak valid" });
  }
  res.status(500).json({ message: error.message });
};

const getTransactions = async (req, res) => {
  try {
    const { month, type } = req.query;

    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ message: "Bulan harus berformat YYYY-MM" });
    }
    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "Jenis harus income atau expense" });
    }

    const transactions = await transactionModel.findAllByUser(req.userId, { month, type });
    res.status(200).json({ transactions });
  } catch (error) {
    handleError(res, error);
  }
};

const createTransaction = async (req, res) => {
  try {
    const { data, error } = await parseInput(req.body, req.userId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const transaction = await transactionModel.create(req.userId, data);
    res.status(201).json({ transaction });
  } catch (error) {
    handleError(res, error);
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { data, error } = await parseInput(req.body, req.userId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const transaction = await transactionModel.update(req.params.id, req.userId, data);
    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const deleted = await transactionModel.remove(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({ message: "Transaksi dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};