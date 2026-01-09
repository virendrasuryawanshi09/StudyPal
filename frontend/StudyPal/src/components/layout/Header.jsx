import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header
      className="
        sticky top-0 z-40 w-full h-16
        bg-white/90 dark:bg-[#181b22]/80
        backdrop-blur-xl
        border-b border-slate-200/60 dark:border-slate-700/60
        transition-colors duration-300
      "
    >
      <div className="flex items-center justify-between h-full px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="
              md:hidden inline-flex items-center justify-center
              w-10 h-10 rounded-xl
              text-slate-600 dark:text-slate-300
              hover:text-slate-900 dark:hover:text-white
              hover:bg-slate-200/70 dark:hover:bg-[#232734]
              transition-all duration-200
            "
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <button
            className="
              relative inline-flex items-center justify-center
              w-10 h-10 rounded-xl
              text-slate-600 dark:text-slate-300
              hover:text-slate-900 dark:hover:text-white
              hover:bg-slate-200/70 dark:hover:bg-[#232734]
              transition-all duration-200
              group
            "
          >
            <Bell
              size={20}
              strokeWidth={2}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span
              className="
                absolute top-1.5 right-1.5
                w-2 h-2 rounded-full
                bg-slate-700 dark:bg-indigo-500
                ring-2 ring-white dark:ring-[#181b22]
              "
            />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60 dark:border-slate-700/60">
            <div
              className="
                flex items-center gap-3 px-3 py-1.5 rounded-xl
                hover:bg-slate-200/50 dark:hover:bg-[#232734]
                transition-colors duration-200
                cursor-pointer group
              "
            >
              <div
                className="
                  w-9 h-9 rounded-xl
                  bg-gradient-to-br from-slate-700 to-slate-600
                  dark:from-indigo-600 dark:to-indigo-500
                  flex items-center justify-center text-white
                  shadow-md shadow-slate-500/20 dark:shadow-indigo-500/20
                  group-hover:shadow-lg
                  transition-all duration-200
                "
              >
                <User size={18} strokeWidth={2.5} />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
