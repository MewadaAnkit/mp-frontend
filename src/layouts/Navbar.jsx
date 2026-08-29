import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, LogOut, User as UserIcon, Calendar, Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { sessions, currentSession, setCurrentSession } = useAcademic();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Session Badge & Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-1.5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-600">
          <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">Session:</span>
          <div className="relative flex items-center">
            <select
              value={currentSession?.sessionName || ''}
              onChange={(e) => {
                const matched = sessions.find(s => s.sessionName === e.target.value);
                if (matched) setCurrentSession(matched);
              }}
              className="bg-transparent text-xs font-black text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {sessions.map(s => (
                <option key={s._id} value={s.sessionName} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-200">
                  {s.sessionName} {s.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400 absolute right-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* User profile, Theme Toggle & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer ${
            isDark
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              : 'bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200 text-indigo-700'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* User profile pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{user?.name || 'Administrator'}</p>
            <span className="inline-block text-[10px] text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-500/15 px-2 py-0.2 rounded-md mt-0.5 uppercase tracking-wide">
              {user?.role || 'Staff'}
            </span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20 flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
