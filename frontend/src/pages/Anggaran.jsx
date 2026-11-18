import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoriesApi";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../api/budgetsApi";

const currentMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

const formatRupiah = (n) => "Rp " + n.toLocaleString("id-ID");

const formatAmount = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

function Chevron() {
  return (
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
  );
}

export default function Anggaran() {
  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  async function loadBudgets() {
    setLoading(true);
    setError("");
    try {
      setBudgets(await getBudgets({ month }));
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat anggaran");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, [month]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data.filter((c) => c.type === "expense"));
      } catch (err) {
        setFormError(err.response?.data?.message || "Gagal memuat kategori");
      }
    }
    loadCategories();
  }, []);

  const cancelEdit = () => {
    setEditingId(null);
    setCategoryId("");
    setAmount("");
    setFormError("");
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setCategoryId(String(b.category_id));
    setAmount(formatAmount(String(b.amount)));
    setFormError("");
    window.scrollTo({ top: 0 });
  };

  const handleMonthChange = (value) => {
    cancelEdit();
    setMonth(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const amountValue = Number(amount.replace(/\D/g, ""));
    if (!amountValue) {
      setFormError("Jumlah harus lebih dari 0");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateBudget(editingId, amountValue);
      } else {
        await createBudget({
          categoryId: Number(categoryId),
          amount: amountValue,
          month,
        });
      }
      cancelEdit();
      await loadBudgets();
    } catch (err) {
      setFormError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Hapus anggaran ${b.category_name} ${formatRupiah(b.amount)}?`)) return;

    setDeleteError("");
    try {
      await deleteBudget(b.id);
      if (editingId === b.id) cancelEdit();
      await loadBudgets();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Anggaran</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="rounded-ui bg-field px-4 py-2 text-ink outline-none"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-card bg-page p-6 md:grid-cols-2"
      >
        <div className="grid gap-2">
          <label htmlFor="budget-category" className="text-sm font-medium">
            Kategori pengeluaran
          </label>
          <div className="relative">
            <select
              id="budget-category"
              required
              disabled={Boolean(editingId)}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-ui bg-field py-3 pl-4 pr-12 disabled:opacity-60"
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-muted">
              Belum ada kategori pengeluaran.{" "}
              <Link to="/kategori" className="font-semibold text-brand underline">
                Buat kategori
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="budget-amount" className="text-sm font-medium">
            Batas anggaran (Rp)
          </label>
          <input
            id="budget-amount"
            type="text"
            inputMode="numeric"
            required
            placeholder="500.000"
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            className="w-full rounded-ui bg-field px-4 py-3"
          />
        </div>

        {formError && (
          <p role="alert" className="text-sm font-medium text-expense md:col-span-2">
            {formError}
          </p>
        )}

        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah anggaran"}
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
      </form>

      {error && <p className="text-expense">{error}</p>}
      {deleteError && <p className="text-expense">{deleteError}</p>}

      {loading ? (
        <p className="text-muted">Memuat...</p>
      ) : budgets.length === 0 ? (
        <p className="text-muted">Belum ada anggaran di bulan ini.</p>
      ) : (
        <ul className="space-y-3">
          {budgets.map((b) => {
            const percent = Math.min(100, Math.round((b.spent / b.amount) * 100));
            const over = b.spent > b.amount;
            return (
              <li key={b.id} className="rounded-card bg-block p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{b.category_name}</span>
                  <span className="text-sm text-muted">{percent}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    className={`h-full rounded-full ${over ? "bg-expense" : "bg-brand"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-muted">
                  {formatRupiah(b.spent)} dari {formatRupiah(b.amount)}
                </p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${over ? "text-expense" : "text-muted"}`}>
                    {over
                      ? `Lebih ${formatRupiah(b.spent - b.amount)}`
                      : `Sisa ${formatRupiah(b.amount - b.spent)}`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(b)}
                      className="text-sm font-medium text-brand"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b)}
                      className="text-sm font-medium text-expense"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}