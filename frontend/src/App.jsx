import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Kategori from "./pages/Kategori";
import Transaksi from "./pages/Transaksi";
import Anggaran from "./pages/Anggaran";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kategori" element={<Kategori />} />
          <Route path="/transaksi" element={<Transaksi />} />
            <Route path="/Anggaran" element={<Anggaran />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    
  );
}

export default App;