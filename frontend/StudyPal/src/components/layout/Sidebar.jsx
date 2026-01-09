import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BrainCircuit,
  BookOpen,
  X,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/40
          transition-opacity duration-300
          md:hidden
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-white dark:bg-[#181b22]
          border-r border-slate-200/60 dark:border-slate-700/60
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand */}
        <div
          className="
            flex items-center justify-between
            h-16 px-5
            border-b border-slate-200/60 dark:border-slate-700/60
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex items-center justify-center
                w-9 h-9 rounded-xl
                bg-slate-700 dark:bg-indigo-600
                text-white
                shadow-md
              "
            >
              <BrainCircuit size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">
              StudyPal
            </h1>
          </div>

          {/* Close (Mobile) */}
          <button
            onClick={toggleSidebar}
            className="
              md:hidden
              text-slate-500 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-white
            "
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `
                  group flex items-center gap-3
                  px-4 py-2.5 rounded-lg
                  text-sm font-semibold
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-slate-800 text-white dark:bg-indigo-600'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#232734] hover:text-slate-900 dark:hover:text-white'
                  }
                `
              }
            >
              <link.icon size={18} />
              {link.text}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          className="
            px-3 py-4
            border-t border-slate-200/60 dark:border-slate-700/60
          "
        >
          <button
            onClick={handleLogout}
            className="
              group flex items-center gap-3 w-full
              px-4 py-2.5 rounded-xl
              text-sm font-semibold
              text-slate-700 dark:text-slate-300
              hover:bg-red-50 dark:hover:bg-red-500/10
              hover:text-red-600
              transition-all duration-200
            "
          >
            <LogOut size={18} strokeWidth={2.5} />
            LogOut
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
