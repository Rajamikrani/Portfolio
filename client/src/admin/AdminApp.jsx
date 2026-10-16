import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useApp } from '../context';
import { errMsg } from '../api';
import { RES, SINGLE, NAV } from './config';
import Resource from './Resource';
import { Singleton, Dashboard, Messages } from './Pages';

function Login() {
  const { login, user, toast } = useApp();
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { await login(email, password); } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); } };
  return <div className="min-h-screen grid place-items-center p-4"><form onSubmit={submit} className="card w-full max-w-sm space-y-3"><h1 className="text-xl font-bold">Admin login</h1><input className="input" type="email" placeholder="Email" aria-label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /><input className="input" type="password" placeholder="Password" aria-label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button className="btn btn-p w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div>;
}

function Shell() {
  const { user, ready, logout, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  if (!ready) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <div className="min-h-screen md:flex">
      <aside className={`${open ? 'block' : 'hidden'} md:block md:w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <p className="font-mono text-cyan-500 px-2 py-3">Portfolio CMS</p>
        {NAV.map(([p, label]) => <NavLink key={p} end={p === ''} to={`/admin/${p}`} onClick={() => setOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{label}</NavLink>)}
        <a href="/" target="_blank" rel="noreferrer" className="block px-3 py-1.5 mt-3 text-sm text-slate-500">View site ↗</a>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between"><button className="md:hidden btn !p-1.5" aria-label="Menu" onClick={() => setOpen(!open)}><Menu size={16} /></button><span className="text-sm text-slate-500 ml-auto mr-3">{user.email}</span>
          <button className="btn !p-1.5 mr-2" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button><button className="btn !p-1.5" onClick={async () => { await logout(); nav('/admin/login'); }}><LogOut size={16} />Logout</button></header>
        <div className="p-5"><Outlet /></div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        {Object.entries(RES).map(([k, c]) => <Route key={k} path={k} element={<Resource key={k} cfg={c} />} />)}
        {Object.entries(SINGLE).map(([k, c]) => <Route key={k} path={k} element={<Singleton key={k} cfg={c} />} />)}
        <Route path="messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
