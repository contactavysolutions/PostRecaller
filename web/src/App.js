import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/lib/theme";
import Landing from "@/pages/Landing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VaultPage from "@/pages/Vault";
import AdminDashboard from "@/pages/Admin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import "@/App.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guides" element={<Navigate to="/faq" replace />} />
            <Route path="/help" element={<Navigate to="/faq" replace />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/vault"
              element={
                <ProtectedRoute>
                  <VaultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgb(var(--surface))",
              color: "rgb(var(--on-surface))",
              border: "1px solid rgb(var(--ds-border))",
              fontFamily: "'Satoshi','Plus Jakarta Sans',sans-serif",
              fontWeight: 500,
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
