import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { LoginPage } from './auth/LoginPage';
import { AuthCallback } from './auth/AuthCallback';
import { EditorPage } from './pages/EditorPage';
import { MyDashboardsPage } from './pages/MyDashboardsPage';
import { SharedDashboardPage } from './pages/SharedDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { VisualLabPage } from './pages/VisualLabPage';

const PBIRendererTest = import.meta.env.DEV
  ? lazy(() => import('./pages/PBIRendererTest').then((module) => ({ default: module.PBIRendererTest })))
  : null;

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={user ? '/dashboards' : '/editor'} replace />;
}

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/dashboards" element={<MyDashboardsPage />} />
        <Route path="/share/:shareId" element={<SharedDashboardPage />} />
        {PBIRendererTest && <Route path="/pbi-renderer-test" element={<PBIRendererTest />} />}
        <Route path="/visual-lab" element={<VisualLabPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
