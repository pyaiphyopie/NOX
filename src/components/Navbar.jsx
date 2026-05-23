import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Discover' },
  { path: '/venues', label: 'Venues' },
  { path: '/promoters', label: 'Promoters' },
  { path: '/tickets', label: 'Tickets' },
];

export default function Navbar({ onGetApp }) {
  const location = useLocation();

  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl">
      <Link to="/" className="no-underline">
        <div>
          <h1 className="text-3xl font-black tracking-[0.3em] text-white">NOX</h1>
          <p className="text-xs text-white/50 tracking-[0.2em] uppercase">Own The Night</p>
        </div>
      </Link>

      <div className="hidden md:flex gap-8 text-sm text-white/70">
        {NAV_ITEMS.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`hover:text-cyan-400 transition no-underline ${
              location.pathname === path ? 'text-cyan-400' : 'text-white/70'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <button
        className="bg-cyan-500 hover:bg-cyan-400 transition px-5 py-2 rounded-full text-black font-semibold"
        onClick={onGetApp}
      >
        Get App
      </button>
    </nav>
  );
}
