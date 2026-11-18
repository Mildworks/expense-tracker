import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoriesApi";

function CategoryGroup({ title, items, colorClass, onEdit, onDelete }) {
  return (
    <section className="rounded-card bg-page p-6">
      <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-muted">Belum ada kategori.</p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {items.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-ui bg-block px-4 py-3"
            >
              <span className="font-medium">{category.name}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  aria-label={`Ubah kategori ${category.name}`}
                  className="rounded-ui px-2 py-1 text-sm font-medium text-brand"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(category)}
                  aria-label={`Hapus kategori ${category.name}`}
                  className="rounded-ui px-2 py-1 text-sm font-medium text-expense"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Kategori() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setCategories(await getCategories());
      } catch (err) {
        setError(err.response?.data?.message || "Tidak bisa terhubung ke server");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        const updated = await updateCategory(editingId, { name, type });
        setCategories((current) =>
          current.map((item) => (item.id === editingId ? updated : item))
        );
        setEditingId(null);
      } else {
        const category = await createCategory({ name, type });
        setCategories((current) => [...current, category]);
      }
      setName("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setFormError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setFormError("");
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;

    setDeleteError("");

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    }
  };

  const income = categories.filter((category) => category.type === "income");
  const expense = categories.filter((category) => category.type === "expense");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Kategori</h1>
      <p className="mt-1 text-muted">Kelompokkan pemasukan dan pengeluaran Anda.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-card bg-page p-6 md:grid-cols-[1fr_auto_auto] md:items-end"
      >
        <div className="grid gap-2">
          <label htmlFor="category-name" className="text-sm font-medium">
            Nama kategori
          </label>
          <input
            id="category-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-ui bg-field px-4 py-3"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="category-type" className="text-sm font-medium">
            Jenis
          </label>
          <div className="relative">
            <select
              id="category-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none rounded-ui bg-field py-3 pl-4 pr-12"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full bg-block px-6 py-3 font-semibold"
            >
              Batal
            </button>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-sm font-medium text-expense md:col-span-3">
            {formError}
          </p>
        )}
      </form>

      {loading && <p className="mt-6 text-muted">Memuat...</p>}

      {error && (
        <p role="alert" className="mt-6 text-sm font-medium text-expense">
          {error}
        </p>
      )}

      {deleteError && (
        <p role="alert" className="mt-6 text-sm font-medium text-expense">
          {deleteError}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <CategoryGroup
            title="Pemasukan"
            items={income}
            colorClass="text-income"
            onEdit={startEdit}
            onDelete={handleDelete}
          />
          <CategoryGroup
            title="Pengeluaran"
            items={expense}
            colorClass="text-expense"
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}