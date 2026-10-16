import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
const Ctx = createContext();
export const useApp = () => useContext(Ctx);
export function Providers({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!location.pathname.startsWith('/admin'));
  const [toasts, setToasts] = useState([]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { if (!ready) api.get('/auth/me').then((r) => setUser(r.data)).catch(() => {}).finally(() => setReady(true)); }, []);
  const toast = (msg, type = 'ok') => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000); };
  const login = async (email, password) => setUser((await api.post('/auth/login', { email, password })).data);
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); setUser(null); };
  return (
    <Ctx.Provider value={{ theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'), user, ready, login, logout, toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2" role="status">
        {toasts.map((t) => <div key={t.id} className={`rounded-lg px-4 py-2 text-sm shadow-lg text-white ${t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{t.msg}</div>)}
      </div>
    </Ctx.Provider>
  );
}
