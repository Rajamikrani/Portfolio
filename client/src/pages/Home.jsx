import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Reveal, useSeo } from '../hooks';
import { track } from '../api';
import * as S from '../components/sections';

const MAP = { hero: S.Hero, about: S.About, skills: S.Skills, projects: S.Projects, experience: S.Experience, education: S.Education, certifications: S.Certifications, achievements: S.Achievements, blog: S.BlogPreview, contact: S.Contact };
export default function Home() {
  const d = useOutletContext();
  useSeo(d.settings.siteTitle, d.settings.siteDescription, d.profile.image);
  useEffect(() => { track('page_view', '/'); if (location.hash) document.querySelector(location.hash)?.scrollIntoView(); }, []);
  return d.settings.sections.filter((s) => s.visible && MAP[s.key]).map(({ key }) => { const C = MAP[key]; return key === 'hero' ? <C key={key} d={d} /> : <Reveal key={key}><C d={d} /></Reveal>; });
}
