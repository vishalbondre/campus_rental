// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  MapPin, Grid, Plus, LayoutDashboard,
  ShieldCheck, LogOut, LogIn, UserPlus, BookOpen
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLink = ({ isActive }) => clsx(
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
    isActive
      ? 'bg-amber-400 text-stone-900'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  );

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="bg-amber-400 text-stone-900 font-display font-black text-lg w-8 h-8 rounded-lg grid place-items-center">C</span>
          <span className="font-display font-bold text-stone-900 text-lg tracking-tight hidden sm:block">
            Campus<span className="text-amber-500">Rent</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/"    className={navLink} end><Grid size={15} />Browse</NavLink>
          <NavLink to="/map" className={navLink}><MapPin size={15} />Map</NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={navLink}><LayoutDashboard size={15} />Dashboard</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={navLink}><ShieldCheck size={15} />Admin</NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/list-item"
                className="hidden sm:flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold text-sm px-3 py-1.5 rounded-lg transition-all">
                <Plus size={15} /> List Item
              </Link>
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-sm grid place-items-center uppercase">
                    {user.fullName?.[0]}
                  </span>
                  <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all">
                <LogIn size={15} /> Sign in
              </Link>
              <Link to="/register"
                className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-all">
                <UserPlus size={15} /> Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
