import { useEffect, useState } from 'react';
import { Trash2, MailOpen, Mail } from 'lucide-react';
import { api, errMsg } from '../api';
import { useApp } from '../context';
import Form from './Form';
import { Modal } from './Resource';

export function Singleton({ cfg }) {
  const { toast } = useApp();
  const [doc, setDoc] = useState(null), [error, setError] = useState('');
  useEffect(() => { api.get(`/${cfg.ep}`).then((r) => setDoc(r.data)).catch((e) => setError(errMsg(e))); }, []);
  const save = async (v) => { try { setDoc((await api.put(`/${cfg.ep}`, v)).data); toast('Saved'); } catch (e) { toast(errMsg(e), 'error'); } };
  return <div className="max-w-2xl"><h1 className="text-2xl font-bold mb-5">{cfg.title}</h1>{error ? <p className="text-red-500">{error}</p> : !doc ? <p className="text-slate-500">Loading…</p> : <div className="card"><Form fields={cfg.fields} value={doc} onSubmit={save} /></div>}</div>;
}

export function Dashboard() {
  const [s, setS] = useState(null), [error, setError] = useState('');
  useEffect(() => { api.get('/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e))); }, []);
  if (error) return <p className="text-red-500">{error}</p>;
  if (!s) return <p className="text-slate-500">Loading…</p>;
  const cards = [['Projects', s.projects], ['Skills', s.skills], ['Blog posts', s.posts], ['Certifications', s.certifications], ['Messages', `${s.messages} (${s.unread} unread)`], ['Experiences', s.experiences]];
  return <div><h1 className="text-2xl font-bold mb-5">Dashboard</h1><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{cards.map(([k, v]) => <div key={k} className="card"><p className="text-sm text-slate-500">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}</div>
    <h2 className="font-semibold mt-8 mb-2">Analytics</h2><p className="text-sm text-slate-500">{Object.keys(s.analytics).length ? Object.entries(s.analytics).map(([k, v]) => `${k}: ${v}`).join(' · ') : 'No events yet (enable analytics in Website Settings).'}</p></div>;
}

export function Messages() {
  const { toast } = useApp();
  const [rows, setRows] = useState(null), [open, setOpen] = useState(null), [error, setError] = useState('');
  const load = () => api.get('/contact').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const mark = async (m, read) => { try { await api.patch(`/contact/${m._id}/read`, { read }); load(); } catch (e) { toast(errMsg(e), 'error'); } };
  const del = async (m) => { if (!confirm('Delete this message?')) return; try { await api.delete(`/contact/${m._id}`); setOpen(null); load(); } catch (e) { toast(errMsg(e), 'error'); } };
  return (
    <div><h1 className="text-2xl font-bold mb-5">Messages</h1>{error && <p className="text-red-500">{error}</p>}
      {!rows ? <p className="text-slate-500">Loading…</p> : !rows.length ? <div className="card text-center text-slate-500">No messages yet.</div> : <div className="space-y-2">{rows.map((m) => (
        <div key={m._id} className={`card flex items-center gap-3 ${m.read ? 'opacity-70' : 'border-l-4 !border-l-cyan-500'}`}>
          <button className="flex-1 text-left" onClick={() => { setOpen(m); if (!m.read) mark(m, true); }}><p className="font-medium text-sm">{m.subject} <span className="text-slate-500 font-normal">— {m.name}</span></p><p className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</p></button>
          <button className="btn !p-1.5" title={m.read ? 'Mark unread' : 'Mark read'} onClick={() => mark(m, !m.read)}>{m.read ? <Mail size={14} /> : <MailOpen size={14} />}</button>
          <button className="btn !p-1.5 text-red-500" aria-label="Delete" onClick={() => del(m)}><Trash2 size={14} /></button></div>))}</div>}
      {open && <Modal title={open.subject} onClose={() => setOpen(null)}><p className="text-sm mb-3">From {open.name} · <a className="text-cyan-500" href={`mailto:${open.email}`}>{open.email}</a></p><p className="whitespace-pre-line text-sm">{open.message}</p><div className="text-right mt-4"><button className="btn" onClick={() => setOpen(null)}>Close</button></div></Modal>}
    </div>
  );
}
