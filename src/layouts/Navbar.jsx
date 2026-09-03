import React from 'react';
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
  Sparkles,
  ChevronDown,
  Globe,
  Languages
} from 'lucide-react';

export default function Navbar({ toggleSidebar, openCommandPalette }) {
  const { user, logout } = useAuth();
  const { sessions, currentSession, setCurrentSession } = useAcademic();
  const { theme, toggleTheme, isDark } = useTheme();
  const { lang, toggleLanguage, setLanguage, isHindi, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Spotlight Search Trigger */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('common.searchPlaceholder', 'Quick search or command...')}</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Active Session Badge & Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 py-1.5 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-600">
          <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">
            {t('common.session', 'Session')}:
          </span>
          <div className="relative flex items-center">
            <select
              value={currentSession?.sessionName || ''}
              onChange={(e) => {
                const matched = sessions.find((s) => s.sessionName === e.target.value);
                if (matched) setCurrentSession(matched);
              }}
              className="bg-transparent text-xs font-black text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {sessions.map((s) => (
                <option
                  key={s._id}
                  value={s.sessionName}
                  className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-200"
                >
                  {s.sessionName} {s.isCurrent ? `(${t('common.active', 'Active')})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400 absolute right-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* User profile, Language Switcher, Theme Toggle & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={openCommandPalette}
          className="sm:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Bilingual Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-black shadow-xs cursor-pointer ${
            isHindi
              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300'
          }`}
        >
          <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-extrabold">{isHindi ? 'हिंदी' : 'English'}</span>
          <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-black/10 dark:bg-white/10">
            {isHindi ? 'EN' : 'HI'}
          </span>
        </button>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`px-3 py-1.5 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer ${
            isDark
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              : 'bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200 text-indigo-700'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{t('common.lightMode', 'Light')}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">{t('common.darkMode', 'Dark')}</span>
            </>
          )}
        </button>

        {/* User profile pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Administrator'}</p>
            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.2 rounded-full mt-0.5 uppercase tracking-wide">
              {user?.role || 'Staff'}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <button
            onClick={logout}
            title={t('nav.signOut', 'Sign Out')}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
