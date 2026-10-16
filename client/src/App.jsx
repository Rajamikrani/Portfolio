import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import { Blog, Post } from './pages/Blog';
import NotFound from './pages/NotFound';
const Admin = lazy(() => import('./admin/AdminApp'));
export default function App() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Post />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
