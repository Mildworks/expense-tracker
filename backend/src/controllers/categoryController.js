const categoryModel = require("../models/categoryModel");

const VALID_TYPES = ["income", "expense"];

const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.findAllByUser(req.userId);
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !name.trim() || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "Nama wajib diisi, jenis harus income atau expense" });
    }

    const category = await categoryModel.create(req.userId, name.trim(), type);
    res.status(201).json({ category });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Kategori sudah ada" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !name.trim() || !VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "Nama wajib diisi, jenis harus income atau expense" });
    }

    const category = await categoryModel.update(req.params.id, req.userId, name.trim(), type);

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json({ category });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Kategori sudah ada" });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryModel.remove(req.params.id, req.userId);

    if (!deleted) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json({ message: "Kategori dihapus" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ message: "Kategori masih dipakai oleh transaksi" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };