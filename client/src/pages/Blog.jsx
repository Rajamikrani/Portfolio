import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../api';
import { useLoad, useSeo, Empty } from '../hooks';
import NotFound from './NotFound';

export function Blog() {
  useSeo('Blog | AI & ML articles', 'Articles on machine learning, deep learning, NLP and generative AI.');
  const [q, setQ] = useState(''), [category, setCat] = useState('');
  const all = useLoad(() => api.get('/blog'), []);
  const { data, loading, error } = useLoad(() => api.get('/blog', { params: { q: q || undefined, category: category || undefined } }), [q, category]);
  const cats = [...new Set((all.data || []).map((p) => p.category).filter(Boolean))];
  return (
    <div className="max-w-4xl mx-auto px-5 pt-28 pb-16 min-h-screen">
      <h1 className="h2">Blog</h1>
      <div className="flex flex-wrap gap-3 mb-6"><input className="input max-w-xs" placeholder="Search articles…" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px] dark:bg-slate-900" aria-label="Category" value={category} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? <Empty>Loading…</Empty> : !data?.length ? <Empty>No articles found.</Empty> : <div className="space-y-4">{data.map((p) => <Link key={p._id} to={`/blog/${p.slug}`} className="card block hover:border-cyan-500/60 transition"><h2 className="font-semibold text-lg text-slate-900 dark:text-white">{p.title}</h2><p className="text-xs font-mono text-slate-500">{new Date(p.publishedAt).toLocaleDateString()} {p.category && `· ${p.category}`}</p><p className="text-sm mt-1">{p.excerpt}</p></Link>)}</div>}
    </div>
  );
}

export function Post() {
  const { slug } = useParams();
  const { data: p, loading, error } = useLoad(() => api.get(`/blog/${slug}`), [slug]);
  useSeo(p ? `${p.title} | Blog` : 'Blog', p?.excerpt, p?.image);
  if (loading) return <div className="min-h-screen grid place-content-center text-slate-500">Loading…</div>;
  if (error || !p) return <NotFound />;
  return (
    <article className="max-w-3xl mx-auto px-5 pt-28 pb-16">
      <Link to="/blog" className="text-sm text-cyan-500">← Blog</Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{p.title}</h1>
      <p className="text-xs font-mono text-slate-500 mt-1">{new Date(p.publishedAt).toLocaleDateString()}</p>
      <div className="flex gap-2 mt-3">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      {p.image && <img src={p.image} alt={p.title} className="rounded-xl my-6 w-full" />}
      <div className="space-y-4 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_a]:text-cyan-500 [&_ul]:list-disc [&_ul]:pl-5 [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto"><ReactMarkdown>{p.content || ''}</ReactMarkdown></div>
    </article>
  );
}
