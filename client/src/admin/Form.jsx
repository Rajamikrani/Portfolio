import { useState } from 'react';
import { ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { api, errMsg } from '../api';
import { useApp } from '../context';

const toForm = (fields, v = {}) => Object.fromEntries(fields.map((f) => [f.k, f.type === 'list' ? (v[f.k] || []).join('\n') : f.type === 'date' ? String(v[f.k] || '').slice(0, 10) : f.type === 'bool' ? v[f.k] ?? (f.k === 'published' ? false : false) : v[f.k] ?? '']));
const toApi = (fields, s) => Object.fromEntries(fields.map((f) => [f.k, f.type === 'list' ? s[f.k].split('\n').map((x) => x.trim()).filter(Boolean) : f.type === 'number' ? Number(s[f.k]) || 0 : s[f.k]]));

export default function Form({ fields, value, onSubmit, onCancel }) {
  const { toast } = useApp();
  const [s, setS] = useState(() => toForm(fields, value));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const upload = async (k, file, append) => {
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try { const { data } = await api.post('/upload', fd); set(k, append ? `${s[k]}${s[k] ? '\n' : ''}${data.url}` : data.url); toast('Uploaded'); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { await onSubmit({ ...value, ...toApi(fields, s) }); } finally { setBusy(false); } };
  const move = (i, d) => { const a = [...s.sections]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set('sections', a); };
  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f) => (
        <label key={f.k} className="block text-sm">
          {f.type !== 'bool' && <span className="block mb-1 font-medium">{f.label}</span>}
          {f.type === 'textarea' || f.type === 'list' ? <textarea className="input" rows={f.rows || (f.type === 'list' ? 4 : 3)} value={s[f.k]} onChange={(e) => set(f.k, e.target.value)} />
            : f.type === 'bool' ? <span className="flex gap-2 items-center"><input type="checkbox" checked={!!s[f.k]} onChange={(e) => set(f.k, e.target.checked)} />{f.label}</span>
            : f.type === 'sections' ? <div className="space-y-1">{s.sections.map((x, i) => <div key={x.key} className="flex items-center gap-2 card !p-2 capitalize"><input type="checkbox" checked={x.visible} onChange={(e) => set('sections', s.sections.map((y, j) => (j === i ? { ...y, visible: e.target.checked } : y)))} /><span className="flex-1">{x.key}</span><button type="button" className="btn !p-1" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></button><button type="button" className="btn !p-1" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></button></div>)}</div>
            : f.type === 'image' ? <span className="flex gap-2"><input className="input" placeholder="https://…" value={s[f.k]} onChange={(e) => set(f.k, e.target.value)} /><span className="btn cursor-pointer"><Upload size={14} />Upload<input type="file" hidden accept="image/*,application/pdf" onChange={(e) => upload(f.k, e.target.files[0])} /></span></span>
            : <input className="input" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={s[f.k]} onChange={(e) => set(f.k, e.target.value)} />}
          {f.upload && <span className="btn cursor-pointer mt-2 w-fit"><Upload size={14} />Upload image<input type="file" hidden accept="image/*" onChange={(e) => upload(f.k, e.target.files[0], true)} /></span>}
        </label>
      ))}
      <div className="flex gap-2 justify-end">{onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}<button className="btn btn-p" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
    </form>
  );
}
