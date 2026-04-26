import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "@/components/Toast";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Predict } from "@/pages/Predict";
import { History } from "@/pages/History";
import { Profile } from "@/pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/predict" element={<Predict />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}
