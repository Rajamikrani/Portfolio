import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { api } from '../api';
import { useLoad } from '../hooks';
import { useApp } from '../context';

export default function PublicLayout() {
  const { theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const { data, loading, error } = useLoad(() => api.get('/site'));
  const links = (data?.settings.sections || []).filter((s) => s.visible && s.key !== 'hero').map((s) => s.key);
  const to = (k) => (k === 'blog' ? '/blog' : `/#${k}`);
  const Theme = <button onClick={toggleTheme} aria-label="Toggle theme" className="p-1.5">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>;
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <nav className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between" aria-label="Main">
          <Link to="/" className="font-mono font-medium text-cyan-500">{data?.profile.name || 'Portfolio'}</Link>
          <div className="hidden md:flex items-center gap-5 text-sm capitalize">
            {links.map((k) => <a key={k} href={to(k)} className="hover:text-cyan-500">{k}</a>)}
            {data?.profile.resumeUrl && <a href={data.profile.resumeUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-500">Resume</a>}
            {Theme}
          </div>
          <div className="md:hidden flex gap-2">{Theme}<button onClick={() => setOpen(!open)} aria-label="Menu" className="p-1.5">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
        </nav>
        {open && <div className="md:hidden px-5 pb-4 flex flex-col gap-3 capitalize" onClick={() => setOpen(false)}>{links.map((k) => <a key={k} href={to(k)}>{k}</a>)}</div>}
      </header>
      <main>{loading ? <div className="min-h-screen grid place-content-center text-slate-500">Loading…</div> : error ? <div className="min-h-screen grid place-content-center text-center px-5"><p className="text-red-500">Could not load the site: {error}</p><button className="btn mt-4 mx-auto" onClick={() => location.reload()}>Retry</button></div> : <Outlet context={data} />}</main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} {data?.profile.name}</footer>
    </>
  );
}
