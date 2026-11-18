import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transaksi", label: "Transaksi" },
  { to: "/kategori", label: "Kategori" },
  { to: "/anggaran", label: "Anggaran" },
];

const sideLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2.5 font-medium ${
    isActive ? "bg-brand text-white" : "text-ink hover:bg-block"
  }`;

const bottomLinkClass = ({ isActive }) =>
  `py-3 text-center text-xs font-medium ${
    isActive ? "text-brand" : "text-muted"
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-mist md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-page p-6 md:flex">
        <p className="text-xl font-semibold text-brand">Expense Tracker</p>

        <nav aria-label="Menu utama" className="mt-10 grid gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={sideLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-full bg-block py-2.5 font-medium"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 pb-24 md:p-8">
        <Outlet />
      </main>

      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 grid grid-cols-4 bg-page md:hidden"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={bottomLinkClass}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}