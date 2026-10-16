import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Globe, ExternalLink, Download, MapPin, GraduationCap } from 'lucide-react';
import { api, errMsg, track } from '../api';
import { useApp } from '../context';
import { Empty } from '../hooks';

const ICONS = { github: Github, linkedin: Linkedin, email: Mail, mail: Mail };
const href = (u) => (u.includes('@') && !u.startsWith('mailto:') && !u.startsWith('http') ? `mailto:${u}` : u);
const Ext = ({ url, children }) => <a href={url} target="_blank" rel="noreferrer" className="text-sm text-cyan-500">{children}</a>;
export const Section = ({ id, title, children }) => <section id={id} className="py-20 scroll-mt-14"><div className="max-w-6xl mx-auto px-5"><h2 className="h2"><span className="font-mono text-cyan-500 text-lg mr-2">/</span>{title}</h2>{children}</div></section>;
const Tags = ({ items = [] }) => <div className="flex flex-wrap gap-1.5">{items.map((t) => <span key={t} className="tag">{t}</span>)}</div>;

function Neural() {
  const L = [3, 5, 5, 2], pts = L.map((n, i) => Array.from({ length: n }, (_, j) => [50 + i * 100, (300 / n) * (j + 0.5)]));
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto" role="img" aria-label="Neural network illustration">
      {pts.slice(1).map((layer, i) => pts[i].flatMap((a, x) => layer.map((b, y) => <line key={`${i}${x}${y}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="stroke-cyan-500/25" />)))}
      {pts.flat().map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="7" className="fill-cyan-500 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}
    </svg>
  );
}

export function Hero({ d }) {
  const p = d.profile, socials = d.socials.filter((s) => s.url);
  return (
    <section id="hero" className="min-h-screen flex items-center pt-14 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,.12),transparent_60%)]">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center py-16">
        <div>
          <p className="font-mono text-sm text-cyan-500 mb-3">{p.title}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">{p.heroHeadline}</h1>
          <p className="mt-5 text-lg max-w-xl">{p.heroDescription}</p>
          <p className="mt-5 font-mono text-xs text-slate-500 flex flex-wrap gap-x-2">{(p.heroPath || []).map((s, i) => <span key={s}>{i > 0 && '→ '}{s}</span>)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#projects" className="btn btn-p">View My Projects</a>
            {p.resumeUrl ? <a href={p.resumeUrl} target="_blank" rel="noreferrer" onClick={() => track('resume_click', 'hero')} className="btn"><Download size={16} />Download Resume</a> : <button className="btn" disabled title="Resume not uploaded yet">Download Resume</button>}
            <a href="#contact" className="btn">Contact Me</a>
          </div>
          <div className="mt-6 flex gap-3">{socials.map((s) => { const I = ICONS[s.platform.toLowerCase()] || Globe; return <a key={s._id} href={href(s.url)} target="_blank" rel="noreferrer" aria-label={s.platform} title={s.platform} className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:text-cyan-500"><I size={18} /></a>; })}</div>
        </div>
        <div className="hidden md:block"><Neural /></div>
      </div>
    </section>
  );
}

export function About({ d }) {
  const p = d.profile;
  return (
    <Section id="about" title="About">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" className="rounded-xl w-full max-w-[240px] aspect-square object-cover" /> : <div className="rounded-xl bg-slate-200 dark:bg-slate-800 aspect-square max-w-[240px] grid place-content-center font-mono text-4xl text-cyan-500">{p.name?.[0]}</div>}
        <div>
          <p className="whitespace-pre-line leading-relaxed">{p.bio}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">{p.location && <span className="flex gap-1 items-center"><MapPin size={14} />{p.location}</span>}{p.status && <span className="flex gap-1 items-center"><GraduationCap size={14} />{p.status}</span>}</div>
          {p.objective && <blockquote className="mt-5 border-l-2 border-cyan-500 pl-4 italic text-sm">{p.objective}</blockquote>}
        </div>
      </div>
    </Section>
  );
}

export function Skills({ d }) {
  const groups = d.skills.reduce((a, s) => ((a[s.category] ||= []).push(s), a), {});
  return (
    <Section id="skills" title="Skills">
      {!d.skills.length ? <Empty>No skills added yet.</Empty> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(groups).map(([cat, list]) => <div key={cat} className="card hover:border-cyan-500/60 transition"><h3 className="font-semibold text-slate-900 dark:text-white mb-3">{cat}</h3><div className="flex flex-wrap gap-1.5">{list.map((s) => <span key={s._id} className="tag" title={s.level ? `${s.level}%` : ''}>{s.name}</span>)}</div></div>)}</div>}
    </Section>
  );
}

export function Projects({ d }) {
  return (
    <Section id="projects" title="Projects">
      {!d.projects.length ? <Empty>No projects published yet.</Empty> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {d.projects.map((p) => (
          <article key={p._id} className="card p-0 overflow-hidden flex flex-col hover:-translate-y-1 hover:border-cyan-500/60 transition">
            {p.image ? <img src={p.image} alt={p.title} loading="lazy" className="h-40 w-full object-cover" /> : <div className="h-40 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 grid place-content-center font-mono text-cyan-500">{'</>'}</div>}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-sm flex-1">{p.summary}</p>
              <Tags items={p.tech.slice(0, 6)} />
              <div className="flex flex-wrap gap-2 pt-1">
                {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="btn !px-3 !py-1.5"><Github size={14} />GitHub</a>}
                {p.demo && <a href={p.demo} target="_blank" rel="noreferrer" className="btn !px-3 !py-1.5"><ExternalLink size={14} />Live Demo</a>}
                <Link to={`/projects/${p.slug}`} className="btn btn-p !px-3 !py-1.5">Details</Link>
              </div>
            </div>
          </article>
        ))}
      </div>}
    </Section>
  );
}

const Timeline = ({ items }) => <ol className="border-l border-slate-300 dark:border-slate-700 ml-2 space-y-6">{items.map((i) => <li key={i.key} className="pl-6 relative"><span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-cyan-500" />{i.body}</li>)}</ol>;
const dates = (a, b) => [a, b].filter(Boolean).join(' – ');
const H3 = ({ children }) => <h3 className="font-semibold text-slate-900 dark:text-white">{children}</h3>;

export function Experience({ d }) {
  return (
    <Section id="experience" title="Experience">
      {!d.experience.length ? <p>{d.settings.noExperienceText}</p> : <Timeline items={d.experience.map((e) => ({ key: e._id, body: <div><H3>{[e.position, e.organization].filter(Boolean).join(' · ')}</H3><p className="text-xs font-mono text-slate-500">{[e.type, e.location, dates(e.start, e.end)].filter(Boolean).join(' · ')}</p><p className="mt-2 text-sm whitespace-pre-line">{e.description}</p>{!!e.achievements.length && <ul className="list-disc pl-5 text-sm mt-2">{e.achievements.map((a) => <li key={a}>{a}</li>)}</ul>}<div className="mt-2"><Tags items={e.tech} /></div>{e.certificateUrl && <Ext url={e.certificateUrl}>Certificate ↗</Ext>}</div> }))} />}
    </Section>
  );
}

export function Education({ d }) {
  return (
    <Section id="education" title="Education">
      {!d.education.length ? <Empty>No education added yet.</Empty> : <Timeline items={d.education.map((e) => ({ key: e._id, body: <div><H3>{e.degree}</H3><p className="text-sm">{[e.institution, e.field].filter(Boolean).join(' · ')}</p><p className="text-xs font-mono text-slate-500">{[e.status, e.country, dates(e.start, e.end), e.gpa && `GPA ${e.gpa}`].filter(Boolean).join(' · ')}</p>{e.description && <p className="mt-2 text-sm">{e.description}</p>}<div className="mt-2"><Tags items={e.coursework} /></div>{e.certificateUrl && <Ext url={e.certificateUrl}>Certificate ↗</Ext>}</div> }))} />}
    </Section>
  );
}

export function Certifications({ d }) {
  return (
    <Section id="certifications" title="Certifications">
      {!d.certifications.length ? <Empty>No certifications added yet.</Empty> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{d.certifications.map((c) => <div key={c._id} className="card">{c.image && <img src={c.image} alt={c.name} loading="lazy" className="h-32 w-full object-cover rounded mb-3" />}<H3>{c.name}</H3><p className="text-sm">{c.issuer}</p><p className="text-xs font-mono text-slate-500">{[c.date, c.credentialId].filter(Boolean).join(' · ')}</p>{c.url && <Ext url={c.url}>Verify ↗</Ext>}</div>)}</div>}
    </Section>
  );
}

export function Achievements({ d }) {
  return (
    <Section id="achievements" title="Achievements">
      {!d.achievements.length ? <Empty>No achievements added yet.</Empty> : <div className="grid sm:grid-cols-2 gap-4">{d.achievements.map((a) => <div key={a._id} className="card">{a.category && <span className="tag">{a.category}</span>}<div className="mt-2"><H3>{a.title}</H3></div><p className="text-sm">{a.description}</p><p className="text-xs font-mono text-slate-500">{a.date}</p>{a.url && <Ext url={a.url}>View ↗</Ext>}</div>)}</div>}
    </Section>
  );
}

export function BlogPreview({ d }) {
  return (
    <Section id="blog" title="Latest Articles">
      {!d.posts.length ? <Empty>No articles published yet.</Empty> : <div className="grid md:grid-cols-3 gap-4">{d.posts.map((p) => <Link key={p._id} to={`/blog/${p.slug}`} className="card hover:border-cyan-500/60 transition"><H3>{p.title}</H3><p className="text-sm mt-1">{p.excerpt}</p></Link>)}</div>}
      <Link to="/blog" className="btn mt-6 w-fit">All articles</Link>
    </Section>
  );
}

export function Contact({ d }) {
  const { toast } = useApp();
  const blank = { name: '', email: '', subject: '', message: '' };
  const [f, setF] = useState(blank), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post('/contact', f); toast('Message sent. Thank you!'); setF(blank); } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }), required: true, className: 'input' });
  return (
    <Section id="contact" title="Contact">
      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        <div className="space-y-2 text-sm">{d.profile.contactEmail && <p><Mail size={14} className="inline mr-2" /><a href={`mailto:${d.profile.contactEmail}`}>{d.profile.contactEmail}</a></p>}{d.profile.location && <p><MapPin size={14} className="inline mr-2" />{d.profile.location}</p>}<p className="text-slate-500 pt-2">Open to AI/ML internships, remote roles, research and scholarship opportunities.</p></div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3"><input placeholder="Name" aria-label="Name" maxLength={100} {...bind('name')} /><input type="email" placeholder="Email" aria-label="Email" {...bind('email')} /></div>
          <input placeholder="Subject" aria-label="Subject" maxLength={150} {...bind('subject')} />
          <textarea rows={5} placeholder="Message" aria-label="Message" maxLength={5000} {...bind('message')} />
          <button className="btn btn-p" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        </form>
      </div>
    </Section>
  );
}
