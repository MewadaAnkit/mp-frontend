import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Users,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Bell,
  FileText,
  UserPlus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';

export default function CommandPalette({ isOpen, onClose }) {
  const { t, isHindi } = useLanguage();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setStudents([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchStudents = async () => {
      if (!query || query.trim().length < 2) {
        setStudents([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/students?search=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setStudents(res.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Command search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchStudents, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const quickActions = [
    { label: isHindi ? 'शुल्क संग्रह पटल (Collect Fee)' : 'Collect Fee Payment', path: '/finance/collect', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: isHindi ? 'दैनिक उपस्थिति दर्ज करें' : 'Mark Daily Attendance', path: '/attendance', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
    { label: isHindi ? 'परीक्षा अंक दर्ज करें (Marks Entry)' : 'Enter Examination Marks', path: '/examinations/marks-entry', icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
    { label: isHindi ? 'प्रवेश प्रबंधन एवं लीड्स' : 'Admissions Pipeline & Inquiries', path: '/admissions', icon: UserPlus, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: isHindi ? 'स्कूल सूचना / परिपत्र जारी करें' : 'Post School Announcement', path: '/communication', icon: Bell, color: 'text-amber-500 bg-amber-500/10' },
    { label: isHindi ? 'प्रमाण पत्र / TC जारी करें' : 'Issue Student Certificate', path: '/certificates', icon: FileText, color: 'text-rose-500 bg-rose-500/10' }
  ];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity" />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131b2e]/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isHindi ? 'विद्यार्थी, प्रवेश क्रमांक, त्वरित कमांड खोजें...' : 'Search students, admission numbers, quick commands...'}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Live Student Search Results */}
          {query.trim().length >= 2 && (
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>{isHindi ? 'प्राप्त विद्यार्थी' : 'Matching Students'}</span>
              </p>
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400">{t('common.loading', 'Searching student records...')}</div>
              ) : students.length > 0 ? (
                <div className="space-y-1">
                  {students.map((st) => (
                    <button
                      key={st._id}
                      onClick={() => handleSelect(`/students/${st._id}`)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                          {st.currentClass}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {st.studentName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {t('common.admissionNo', 'Adm')}: {st.admissionNo} • {isHindi ? 'कक्षा' : 'Class'} {st.currentClass}-{st.currentSection}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  {isHindi ? 'कोई विद्यार्थी नहीं मिला' : 'No students found matching your query.'}
                </div>
              )}
            </div>
          )}

          {/* Rapid ERP Action Shortcuts */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'त्वरित ERP कार्य' : 'Quick Actions & Commands'}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(act.path)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-left transition-all cursor-pointer group"
                  >
                    <div className={`p-2 rounded-lg ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {act.label}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {act.path}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#0d1322] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{isHindi ? 'नेविगेट करने के लिए क्लिक करें' : 'Click or press Enter to navigate'}</span>
          <span>{isHindi ? 'खोज बंद करने के लिए ESC दबाएं' : 'Press ESC to close'}</span>
        </div>
      </div>
    </div>
  );
}
