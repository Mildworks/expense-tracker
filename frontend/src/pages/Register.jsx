import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import EyeIcon from "../components/ui/EyeIcon";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-mist p-4 sm:p-6">
    <div className="w-full max-w-md overflow-hidden rounded-card bg-page">
        <section className="px-6 py-8 md:p-10">
          <p className="text-lg font-semibold text-brand md:text-xl">Expense Tracker</p>
          <h1 className="mt-5 text-3xl font-bold md:mt-10 md:text-4xl">Buat akun</h1>
          <p className="mt-1 text-muted md:mt-2">Mulai catat keuangan Anda hari ini.</p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:mt-8 md:gap-5">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Nama</label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-ui bg-field px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-ui bg-field px-4 py-3"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="password-hint"
                  className="w-full rounded-ui bg-field py-3 pl-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-ui p-1 text-ink"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              <p id="password-hint" className="text-sm text-muted">
                Minimal 8 karakter.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-expense">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand py-3 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted md:mt-8">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-brand underline">
              Masuk
            </Link>
          </p>
        </section>

    
      </div>
    </main>
  );
}