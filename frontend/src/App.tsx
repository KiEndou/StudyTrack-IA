// Rotas principais do StudyTrack IA.
import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage, ResetPasswordPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PerformancePage } from "./pages/PerformancePage";
import { TutorPage } from "./pages/TutorPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Carregando sua conta...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/disciplinas" element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>} />
      <Route path="/atividades" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/desempenho" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
      <Route path="/tutor" element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
