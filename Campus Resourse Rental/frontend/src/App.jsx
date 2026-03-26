import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import AdminPortal from './pages/AdminPortal';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 }
  }
});

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-stone-50 font-body">
            <Navbar />
            <Routes>
              {/* Public */}
              <Route path="/"               element={<Home />} />
              <Route path="/items/:id"      element={<ItemDetail />} />
              <Route path="/map"            element={<MapView />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/verify"         element={<VerifyEmail />} />
              {/* Protected */}
              <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/list-item"      element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
              {/* Admin */}
              <Route path="/admin/*"        element={<ProtectedRoute adminOnly><AdminPortal /></ProtectedRoute>} />
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster position="top-right" toastOptions={{
            className: 'font-body text-sm',
            style: { background: '#1c1917', color: '#fafaf9' }
          }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
  );
}
