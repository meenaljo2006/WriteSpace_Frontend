import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Home, LayoutGrid, Compass, Users, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

const navLinks = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Features', path: '/features', icon: LayoutGrid },
  { name: 'Explore', path: '/explore', icon: Compass },
  { name: 'Community', path: '/community', icon: Users }, 
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-[#FFFBF5]/90 dark:bg-[#0B192C]/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="/logo.png" alt="WriteSpace" className="w-full h-full object-cover dark:hidden" />
            <img src="/logo_light.png" alt="WriteSpace" className="w-full h-full object-cover hidden dark:block" />
          </div>
          <span className="font-bold text-xl text-[#0B192C] dark:text-white tracking-tight">
            WriteSpace
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-medium transition-all ${
                      isActive
                        ? 'text-[#F97316] bg-orange-50 dark:bg-orange-500/10'
                        : 'text-[#0B192C]/70 dark:text-gray-400 hover:text-[#0B192C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-[#0B192C] dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/15 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-semibold text-[#0B192C] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-1 px-5 py-2 rounded-full bg-[#F97316] text-white text-sm font-semibold hover:bg-[#ea580c] shadow-lg shadow-orange-500/25 transition"
          >
            Get Started <ArrowUpRight className="w-4 h-4" />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-[#0B192C] dark:text-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 top-[64px] bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 bg-[#FFFBF5] dark:bg-[#0B192C] border-b border-black/5 dark:border-white/5 shadow-xl z-50"
            >
              <ul className="px-4 py-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <NavLink
                        to={link.path}
                        end={link.path === '/'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                            isActive
                              ? 'text-[#F97316] bg-orange-50 dark:bg-orange-500/10'
                              : 'text-[#0B192C]/80 dark:text-gray-300'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
              <div className="px-4 pb-5 pt-1 flex flex-col gap-2">
                <Link to="/login" className="w-full py-3 rounded-full text-center font-semibold border border-[#0B192C]/10 dark:border-white/10 text-[#0B192C] dark:text-white">
                  Login
                </Link>
                <Link to="/register" className="w-full py-3 rounded-full text-center font-semibold bg-[#F97316] text-white shadow-lg shadow-orange-500/25">
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}