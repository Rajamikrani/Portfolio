import { Link } from 'react-router-dom';
import { useSeo } from '../hooks';
export default function NotFound() {
  useSeo('404 – Page not found');
  return <div className="min-h-[60vh] grid place-content-center text-center pt-24"><p className="font-mono text-cyan-500">404</p><h1 className="text-3xl font-bold my-3">Page not found</h1><Link to="/" className="btn btn-p mx-auto">Back home</Link></div>;
}
