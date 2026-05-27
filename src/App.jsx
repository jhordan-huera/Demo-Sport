import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div className={`toast toast--${toast.type}`}>{toast.message}</div>;
}

function LoginRoute() {
  const { isLoggedIn } = useApp();
  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

function AppRoutes() {
  const { isLoggedIn } = useApp();

  // Login page: no sidebar, no padding
  if (!isLoggedIn) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </>
    );
  }

  // Logged in: full layout with sidebar
  return (
    <div className="app-layout app-layout--with-sidebar">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toast />
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
