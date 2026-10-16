import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { api, errMsg } from '../api';
import { useApp } from '../context';
import Form from './Form';

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[90] bg-black/60 grid place-items-start overflow-y-auto p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="card !bg-white dark:!bg-slate-900 w-full max-w-2xl mx-auto my-8"><h2 className="font-semibold text-lg mb-4">{title}</h2>{children}</div>
  </div>
);

export default function Resource({ cfg }) {
  const { toast } = useApp();
  const [rows, setRows] = useState(null), [error, setError] = useState(''), [edit, setEdit] = useState(null);
  const load = () => api.get(`/${cfg.ep}`).then((r) => { setRows(r.data); setError(''); }).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const save = async (v) => { try { v._id ? await api.put(`/${cfg.ep}/${v._id}`, v) : await api.post(`/${cfg.ep}`, v); toast('Saved'); setEdit(null); load(); } catch (e) { toast(errMsg(e), 'error'); } };
  const del = async (r) => { if (!confirm('Delete this item? This cannot be undone.')) return; try { await api.delete(`/${cfg.ep}/${r._id}`); toast('Deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); } };
  const move = async (i, d) => { const a = [...rows], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setRows(a); try { await api.put(`/${cfg.ep}/reorder`, { ids: a.map((x) => x._id) }); } catch (e) { toast(errMsg(e), 'error'); load(); } };
  const cell = (r, c) => (typeof r[c] === 'boolean' ? (r[c] ? 'Yes' : 'No') : String(r[c] ?? '').slice(0, 60));
  return (
    <div>
      <div className="flex items-center justify-between mb-5"><h1 className="text-2xl font-bold">{cfg.title}</h1><button className="btn btn-p" onClick={() => setEdit({})}><Plus size={16} />Add</button></div>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      {!rows ? <p className="text-slate-500">Loading…</p> : !rows.length ? <div className="card text-center text-slate-500">Nothing here yet. Click “Add” to create the first entry.</div> : (
        <div className="card !p-0 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b border-slate-200 dark:border-slate-800">{cfg.cols.map((c) => <th key={c} className="p-3 capitalize">{c}</th>)}<th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={r._id} className="border-b last:border-0 border-slate-100 dark:border-slate-800">{cfg.cols.map((c) => <td key={c} className="p-3">{cell(r, c)}</td>)}
            <td className="p-3 flex gap-1 justify-end">
              {cfg.reorder && <><button className="btn !p-1.5" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp size={14} /></button><button className="btn !p-1.5" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown size={14} /></button></>}
              {cfg.publish && <button className="btn !p-1.5" title={r.published ? 'Unpublish' : 'Publish'} onClick={() => save({ ...r, published: !r.published })}>{r.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>}
              <button className="btn !p-1.5" aria-label="Edit" onClick={() => setEdit(r)}><Pencil size={14} /></button><button className="btn !p-1.5 text-red-500" aria-label="Delete" onClick={() => del(r)}><Trash2 size={14} /></button>
            </td></tr>)}</tbody></table></div>)}
      {edit && <Modal title={`${edit._id ? 'Edit' : 'Add'} ${cfg.title}`} onClose={() => setEdit(null)}><Form fields={cfg.fields} value={edit} onSubmit={save} onCancel={() => setEdit(null)} /></Modal>}
    </div>
  );
}
