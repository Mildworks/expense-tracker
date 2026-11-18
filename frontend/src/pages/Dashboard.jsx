import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCategoryReport, getMonthlyReport } from "../api/reportsApi";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const compact = (value) =>
  new Intl.NumberFormat("id-ID", { notation: "compact" }).format(value);

const currentMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState("expense");
  const [breakdown, setBreakdown] = useState([]);
  const [breakdownError, setBreakdownError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setMonths(await getMonthlyReport(String(year)));
      } catch (err) {
        setError(err.response?.data?.message || "Tidak bisa terhubung ke server");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [year]);

  useEffect(() => {
    if (!month) return;

    async function loadBreakdown() {
      setBreakdownError("");
      try {
        setBreakdown(await getCategoryReport({ month, type }));
      } catch (err) {
        setBreakdownError(err.response?.data?.message || "Tidak bisa terhubung ke server");
      }
    }

    loadBreakdown();
  }, [month, type]);

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = months.reduce((sum, m) => sum + m.expense, 0);
  const balance = totalIncome - totalExpense;
  const breakdownTotal = breakdown.reduce((sum, c) => sum + c.total, 0);

  const chartData = months.map((m) => ({
    name: MONTH_LABELS[Number(m.month.slice(5)) - 1],
    Pemasukan: m.income,
    Pengeluaran: m.expense,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted">Ringkasan keuangan Anda per tahun.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Tahun sebelumnya"
            className="rounded-full bg-block px-4 py-2 font-semibold"
          >
            &lt;
          </button>
          <span className="min-w-16 text-center font-semibold">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Tahun berikutnya"
            className="rounded-full bg-block px-4 py-2 font-semibold"
          >
            &gt;
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-expense">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Memuat...</p>
      ) : (
        !error && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-card bg-page p-5">
                <p className="text-sm text-muted">Total pemasukan</p>
                <p className="mt-1 text-xl font-semibold text-income">{rupiah(totalIncome)}</p>
              </div>
              <div className="rounded-card bg-page p-5">
                <p className="text-sm text-muted">Total pengeluaran</p>
                <p className="mt-1 text-xl font-semibold text-expense">{rupiah(totalExpense)}</p>
              </div>
              <div className="rounded-card bg-page p-5">
                <p className="text-sm text-muted">Selisih</p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    balance >= 0 ? "text-income" : "text-expense"
                  }`}
                >
                  {rupiah(balance)}
                </p>
              </div>
            </div>

            <section className="rounded-card bg-page p-6">
              <h2 className="font-semibold">Pemasukan dan pengeluaran {year}</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={compact} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(value) => rupiah(value)} />
                    <Legend />
                    <Bar dataKey="Pemasukan" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Pengeluaran" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-card bg-page p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Per kategori</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-full bg-block p-1">
                    {[
                      ["expense", "Pengeluaran"],
                      ["income", "Pemasukan"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setType(value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                          type === value ? "bg-brand text-white" : ""
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-ui bg-field px-4 py-2"
                  />
                </div>
              </div>

              {breakdownError && (
                <p role="alert" className="mt-4 text-sm font-medium text-expense">
                  {breakdownError}
                </p>
              )}

              {breakdown.length === 0 ? (
                <p className="mt-4 text-muted">Belum ada data di bulan ini.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {breakdown.map((c) => {
                    const percent = Math.round((c.total / breakdownTotal) * 100);
                    return (
                      <li key={c.category_id}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{c.category_name}</span>
                          <span className="text-sm text-muted">
                            {rupiah(c.total)} ({percent}%)
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-mist">
                          <div
                            className={`h-full rounded-full ${
                              type === "income" ? "bg-income" : "bg-expense"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}