import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import { api, track } from '../api';
import { useLoad, useSeo } from '../hooks';
import NotFound from './NotFound';

const H = ({ children }) => <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{children}</h2>;
const Block = ({ title, children }) => (children ? <section className="mt-8"><H>{title}</H><p className="whitespace-pre-line">{children}</p></section> : null);
export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, loading, error } = useLoad(() => api.get(`/projects/${slug}`), [slug]);
  useSeo(p ? `${p.title} | Project` : 'Project', p?.summary, p?.image);
  useEffect(() => { if (p) track('project_view', slug); }, [p]);
  if (loading) return <div className="min-h-screen grid place-content-center text-slate-500">Loading…</div>;
  if (error || !p) return <NotFound />;
  return (
    <article className="max-w-3xl mx-auto px-5 pt-28 pb-16">
      <Link to="/#projects" className="text-sm text-cyan-500">← All projects</Link>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-3">{p.title}</h1>
      <p className="mt-3 text-lg">{p.summary}</p>
      <div className="flex flex-wrap gap-2 mt-4">{p.tech.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      <div className="flex gap-3 mt-5">{p.github && <a className="btn" href={p.github} target="_blank" rel="noreferrer"><Github size={16} />GitHub</a>}{p.demo && <a className="btn btn-p" href={p.demo} target="_blank" rel="noreferrer"><ExternalLink size={16} />Live Demo</a>}</div>
      {p.image && <img src={p.image} alt={p.title} className="rounded-xl mt-8 w-full" />}
      <Block title="Problem">{p.problem}</Block><Block title="Solution">{p.solution}</Block><Block title="Architecture">{p.architecture}</Block>
      {!!p.features.length && <section className="mt-8"><H>Features</H><ul className="list-disc pl-5">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></section>}
      <Block title="Challenges">{p.challenges}</Block><Block title="Results">{p.results}</Block>
      {!!p.screenshots.length && <section className="mt-8"><H>Screenshots</H><div className="grid sm:grid-cols-2 gap-3">{p.screenshots.map((s) => <img key={s} src={s} alt={`${p.title} screenshot`} loading="lazy" className="rounded-lg" />)}</div></section>}
      <Block title="Future improvements">{p.future}</Block>
    </article>
  );
}
