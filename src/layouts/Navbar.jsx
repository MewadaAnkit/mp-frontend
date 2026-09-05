import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  LogOut,
  Calendar,
  Sun,
  Moon,
  Search,
  ChevronDown,
  Languages,
  Bell,
  Sparkles,
  Command
} from 'lucide-react';

export default function Navbar({ toggleSidebar, openCommandPalette }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sessions, currentSession, setCurrentSession } = useAcademic();
  const { theme, toggleTheme, isDark } = useTheme();
  const { lang, toggleLanguage, isHindi, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/70 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left Section: Mobile Menu, Search & Active Session */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Spotlight Search Trigger */}
        <button
          onClick={openCommandPalette}
          className="group hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 bg-slate-100/70 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 text-xs font-medium shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            {t('common.searchPlaceholder', 'Quick search or command...')}
          </span>
          <div className="flex items-center gap-0.5 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-md border border-slate-200/80 dark:border-slate-700/80 shadow-2xs font-mono">
              Ctrl+K
            </kbd>
          </div>
        </button>

        {/* Active Session Badge & Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 rounded-full px-3 py-1.5 text-xs transition-all">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>

          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden md:inline">
            {t('common.session', 'Session')}:
          </span>

          <div className="relative flex items-center">
            <select
              value={currentSession?.sessionName || ''}
              onChange={(e) => {
                const matched = sessions.find((s) => s.sessionName === e.target.value);
                if (matched) setCurrentSession(matched);
              }}
              className="bg-transparent text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {sessions.map((s) => (
                <option
                  key={s._id}
                  value={s.sessionName}
                  className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-200 font-sans"
                >
                  {s.sessionName} {s.isCurrent ? `(${t('common.active', 'Active')})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 absolute right-0 pointer-events-none" />
          </div>

          <span className="hidden sm:inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
        </div>
      </div>

      {/* Right Section: Mobile Search, Notifications, Language, Theme & User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          onClick={openCommandPalette}
          className="sm:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notices & Circulars Quick Access */}
        <button
          onClick={() => navigate('/communication')}
          title={isHindi ? 'स्कूल सूचनाएं और परिपत्र' : 'School Notices & Circulars'}
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-150 cursor-pointer"
          aria-label="School Notices"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0c121e]"></span>
        </button>

        {/* Bilingual Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
          className={`px-2.5 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer ${
            isHindi
              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isHindi ? 'हिंदी' : 'English'}</span>
          <span className="text-[9px] font-bold opacity-75 px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono">
            {isHindi ? 'HI' : 'EN'}
          </span>
        </button>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={(e) => toggleTheme(e)}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`theme-toggle-btn p-2 rounded-xl border transition-all duration-200 flex items-center justify-center text-xs shadow-2xs cursor-pointer ${
            isDark
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              : 'bg-slate-100/80 hover:bg-slate-200/70 border-slate-200/80 text-slate-700'
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        {/* Separator Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 pl-1">
          {/* User Details (Desktop) */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'Dr. Rajesh Sharma'}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 uppercase tracking-wider font-mono">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          {/* User Avatar with Online Status */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0 ring-2 ring-emerald-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c121e]" title="Active Online"></span>
          </div>

          {/* Sign Out Action Button */}
          <button
            onClick={logout}
            title={t('nav.signOut', 'Sign Out')}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-150 cursor-pointer ml-0.5"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
