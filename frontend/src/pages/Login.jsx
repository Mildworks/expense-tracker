import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import EyeIcon from "../components/ui/EyeIcon";



export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

return (
  <main className="grid min-h-dvh place-items-center bg-mist p-4 sm:p-6">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-card bg-page md:grid-cols-2">
      <section className="px-6 pb-8 pt-3 md:p-14">
        <p className="text-lg font-semibold text-brand md:text-xl">Expense Tracker</p>
        <h1 className="mt-5 text-3xl font-bold md:mt-10 md:text-4xl">Masuk</h1>
        <p className="mt-1 text-muted md:mt-2">Selamat datang kembali.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:mt-8 md:gap-5">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted md:mt-8">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-brand underline">
            Daftar gratis
          </Link>
        </p>
      </section>

           <aside className="hidden p-4 md:block">
  <div className="grid h-full w-full place-items-center overflow-hidden rounded-card bg-field">
    <img
      src="/images/illustration.png"
      alt="Expense Tracker Illustration"
      className="h-full w-full object-contain"
    />
  </div>
</aside>
    </div>
  </main>
);
}