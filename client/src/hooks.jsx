import { useEffect, useRef, useState } from 'react';
import { errMsg } from './api';
export function useSeo(title, desc, image) {
  useEffect(() => {
    if (title) document.title = title;
    const set = (k, v, attr = 'name') => { if (!v) return; let m = document.querySelector(`meta[${attr}="${k}"]`); if (!m) { m = document.createElement('meta'); m.setAttribute(attr, k); document.head.appendChild(m); } m.content = v; };
    set('description', desc); set('og:title', title, 'property'); set('og:description', desc, 'property'); set('og:image', image, 'property'); set('og:type', 'website', 'property');
  }, [title, desc, image]);
}
export function useLoad(fn, deps = []) {
  const [s, set] = useState({ data: null, loading: true, error: '' });
  useEffect(() => { let on = true; set((x) => ({ ...x, loading: true, error: '' })); fn().then((r) => on && set({ data: r.data, loading: false, error: '' })).catch((e) => on && set({ data: null, loading: false, error: errMsg(e) })); return () => { on = false; }; }, deps);
  return s;
}
export function Reveal({ children, className = '' }) {
  const ref = useRef();
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { ref.current.classList.add('in'); o.disconnect(); } }, { threshold: 0.1 }); o.observe(ref.current); return () => o.disconnect(); }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
export const Empty = ({ children }) => <p className="text-slate-500 text-sm py-6">{children}</p>;
