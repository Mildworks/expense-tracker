import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoriesApi";
import {
    createTransaction,
    deleteTransaction,
    getTransactions,
    updateTransaction,
} from "../api/transactionsApi";




const today = () => new Date().toLocaleDateString("en-CA");
const currentMonth = () => today().slice(0, 7);

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",


    });

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

export default function Transaksi() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [month, setMonth] = useState(currentMonth());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(today());
    const [note, setNote] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [editingId, setEditingId] = useState(null);


    useEffect(() => {
        async function loadCategories() {
            try {
                setCategories(await getCategories());
            } catch (err) {
                setFormError(err.response?.data?.message || "Tidak bisa terhubung ke server");
            }
        }

        loadCategories();
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");

            try {
                setTransactions(await getTransactions({ month }));
            } catch (err) {
                setError(err.response?.data?.message || "Tidak bisa terhubung ke server");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [month, refreshKey]);

    const expenseCategories = categories.filter((category) => category.type === "expense");
    const incomeCategories = categories.filter((category) => category.type === "income");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        const amountValue = Number(amount.replace(/\D/g, ""));
        if (!amountValue) {
            setFormError("Jumlah harus lebih dari 0");
            return;
        }

        setSubmitting(true);

        const payload = {
            categoryId: Number(categoryId),
            amount: amountValue,
            date,
            note,
        };

        try {
            if (editingId) {
                await updateTransaction(editingId, payload);
                setEditingId(null);
            } else {
                await createTransaction(payload);
            }
            setAmount("");
            setNote("");
            setMonth(date.slice(0, 7));
            setRefreshKey((key) => key + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Tidak bisa terhubung ke server");
        } finally {
            setSubmitting(false);
        }
    };




    const startEdit = (item) => {
        setEditingId(item.id);
        setCategoryId(String(item.category_id));
        setAmount(formatAmount(String(item.amount)));
        setDate(item.date);
        setNote(item.note || "");
        setFormError("");
        window.scrollTo({ top: 0 });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setAmount("");
        setNote("");
        setDate(today());
        setFormError("");
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Hapus transaksi ${item.category_name} ${rupiah(item.amount)}?`)) return;

        setDeleteError("");

        try {
            await deleteTransaction(item.id);
            setRefreshKey((key) => key + 1);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Tidak bisa terhubung ke server");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold">Transaksi</h1>
            <p className="mt-1 text-muted">Catatan pemasukan dan pengeluaran Anda.</p>

            <form
                onSubmit={handleSubmit}
                className="mt-6 grid gap-4 rounded-card bg-page p-6 md:grid-cols-2"
            >
                <div className="grid gap-2">
                    <label htmlFor="trx-category" className="text-sm font-medium">
                        Kategori
                    </label>
                    <div className="relative">
                        <select
                            id="trx-category"
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full appearance-none rounded-ui bg-field py-3 pl-4 pr-12"
                        >
                            <option value="" disabled>
                                Pilih kategori
                            </option>
                            <optgroup label="Pengeluaran">
                                {expenseCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Pemasukan">
                                {incomeCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                        <Chevron />
                    </div>
                    {categories.length === 0 && (
                        <p className="text-sm text-muted">
                            Belum ada kategori.{" "}
                            <Link to="/kategori" className="font-semibold text-brand underline">
                                Buat kategori
                            </Link>
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="trx-amount" className="text-sm font-medium">
                        Jumlah (Rp)
                    </label>
                    <input
                        id="trx-amount"
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="5.000"
                        value={amount}
                        onChange={(e) => setAmount(formatAmount(e.target.value))}
                        className="w-full rounded-ui bg-field px-4 py-3"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="trx-date" className="text-sm font-medium">
                        Tanggal
                    </label>
                    <input
                        id="trx-date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-ui bg-field px-4 py-3"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="trx-note" className="text-sm font-medium">
                        Catatan (opsional)
                    </label>
                    <input
                        id="trx-note"
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
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
                        {submitting ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah transaksi"}
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

            <div className="mt-6 grid gap-2 md:max-w-xs">
                <label htmlFor="month" className="text-sm font-medium">
                    Bulan
                </label>
                <input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-ui bg-field px-4 py-3"
                />
            </div>

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
                <section className="mt-6 rounded-card bg-page p-6">
                    {transactions.length === 0 ? (
                        <p className="text-muted">Belum ada transaksi di bulan ini.</p>
                    ) : (
                        <ul className="grid gap-2">
                            {transactions.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-ui bg-block px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium">{item.category_name}</p>
                                        <p className="truncate text-sm text-muted">
                                            {formatDate(item.date)}
                                            {item.note ? `, ${item.note}` : ""}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p
                                            className={`font-semibold ${item.type === "income" ? "text-income" : "text-expense"
                                                }`}
                                        >
                                            {item.type === "income" ? "+" : "-"}
                                            {rupiah(item.amount)}
                                        </p>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(item)}
                                                aria-label={`Ubah transaksi ${item.category_name} ${rupiah(item.amount)}`}
                                                className="rounded-ui text-sm font-medium text-brand"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item)}
                                                aria-label={`Hapus transaksi ${item.category_name} ${rupiah(item.amount)}`}
                                                className="rounded-ui text-sm font-medium text-expense"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}