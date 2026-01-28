import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { LoginPage } from './auth/LoginPage';
import { AuthCallback } from './auth/AuthCallback';
import { EditorPage } from './pages/EditorPage';
import { MyDashboardsPage } from './pages/MyDashboardsPage';
import { SharedDashboardPage } from './pages/SharedDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={user ? '/dashboards' : '/editor'} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/dashboards" element={<MyDashboardsPage />} />
      <Route path="/share/:shareId" element={<SharedDashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
