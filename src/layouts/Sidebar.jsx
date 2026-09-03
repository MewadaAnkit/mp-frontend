import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Briefcase,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  School,
  CreditCard,
  GraduationCap,
  Bell,
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  Home,
  Layers
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t, isHindi } = useLanguage();
  const location = useLocation();

  // Route-based active detection
  const isStudentsActive = location.pathname.startsWith('/students');
  const isAcademicsActive = location.pathname.startsWith('/academic');
  const isFinanceActive = location.pathname.startsWith('/finance');
  const isExamsActive =
    location.pathname.startsWith('/examinations') ||
    location.pathname.startsWith('/results') ||
    location.pathname.startsWith('/external-results');
  const isAdminActive = location.pathname.startsWith('/admin');

  // Accordion open states
  const [studentsOpen, setStudentsOpen] = useState(isStudentsActive);
  const [academicsOpen, setAcademicsOpen] = useState(isAcademicsActive);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive);
  const [examsOpen, setExamsOpen] = useState(isExamsActive);
  const [adminOpen, setAdminOpen] = useState(isAdminActive);

  // Auto-expand section when user navigates to a nested route
  useEffect(() => {
    if (isStudentsActive) setStudentsOpen(true);
    if (isAcademicsActive) setAcademicsOpen(true);
    if (isFinanceActive) setFinanceOpen(true);
    if (isExamsActive) setExamsOpen(true);
    if (isAdminActive) setAdminOpen(true);
  }, [location.pathname]);

  const mainNavItemClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 outline-none select-none ${
      isActive
        ? 'bg-emerald-50/90 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
    }`;

  const accordionBtnClass = (isOpen, hasActiveChild) =>
    `group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer outline-none select-none ${
      hasActiveChild
        ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-500/8'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 outline-none select-none ${
      isActive
        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
    }`;

  const sectionHeading = (title) => (
    <div className="pt-3.5 pb-1 px-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
        {title}
      </p>
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out select-none flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25 shrink-0 ring-1 ring-white/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-white leading-tight tracking-tight">
              {t('common.appName', 'MP School ERP')}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isHindi ? 'म.प्र. बोर्ड' : 'MP Board'} 2025-26
              </span>
            </div>
          </div>
        </div>

        {setIsOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
        )}
      </div>

      {/* Navigation Links Scroll Container */}
      <nav
        onClick={(e) => {
          if (e.target.closest('a') && setIsOpen && window.innerWidth < 1024) {
            setIsOpen(false);
          }
        }}
        className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar"
      >
        {/* Overview Dashboard */}
        <NavLink to="/" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <LayoutDashboard
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.overview', 'Overview Dashboard')}</span>
            </>
          )}
        </NavLink>

        {/* CORE LIFECYCLE */}
        {sectionHeading(t('nav.coreLifecycle', 'Core Lifecycle'))}

        <NavLink to="/admissions" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <UserPlus
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.admissions', 'Admissions Pipeline')}</span>
            </>
          )}
        </NavLink>

        {/* Students Accordion */}
        <div>
          <button
            onClick={() => setStudentsOpen(!studentsOpen)}
            className={accordionBtnClass(studentsOpen, isStudentsActive)}
          >
            <div className="flex items-center gap-3">
              <Users
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isStudentsActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.students', 'Student Management')}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                studentsOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
              }`}
            />
          </button>
          {studentsOpen && (
            <div className="mt-1 ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-0.5">
              <NavLink to="/students" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.studentDirectory', 'Student Directory (360°)')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/students/promotion" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.studentPromotion', 'Session Promotion')}</span>
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        {/* Staff & Teachers */}
        <NavLink to="/staff" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <Briefcase
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.staff', 'Staff & Teachers')}</span>
            </>
          )}
        </NavLink>

        {/* DAILY OPERATIONS */}
        {sectionHeading(t('nav.dailyOps', 'Daily Operations'))}

        <NavLink to="/attendance" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <CheckCircle2
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.attendance', 'Attendance Register')}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/timetable" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <CalendarDays
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.timetable', 'Class Timetable')}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/homework" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <BookOpen
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.homework', 'Homework & Tasks')}</span>
            </>
          )}
        </NavLink>

        {/* Academic Setup Accordion */}
        <div>
          <button
            onClick={() => setAcademicsOpen(!academicsOpen)}
            className={accordionBtnClass(academicsOpen, isAcademicsActive)}
          >
            <div className="flex items-center gap-3">
              <School
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isAcademicsActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.academicSetup', 'Academic Setup')}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                academicsOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
              }`}
            />
          </button>
          {academicsOpen && (
            <div className="mt-1 ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-0.5">
              <NavLink to="/academic/sessions" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.sessions', 'Academic Sessions')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/academic/classes" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.classesSections', 'Classes & Sections')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/academic/subjects" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.subjects', 'Subjects Master')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/academic/combinations" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.subjectStreams', 'Subject Streams (11/12)')}</span>
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        {/* FINANCE & FEES */}
        {sectionHeading(t('nav.feesFinance', 'Fees & Finance'))}
        <div>
          <button
            onClick={() => setFinanceOpen(!financeOpen)}
            className={accordionBtnClass(financeOpen, isFinanceActive)}
          >
            <div className="flex items-center gap-3">
              <CreditCard
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isFinanceActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.feeCounter', 'Fee Counter & Ledger')}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                financeOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
              }`}
            />
          </button>
          {financeOpen && (
            <div className="mt-1 ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-0.5">
              <NavLink to="/finance/collect" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.collectFee', 'Collect Fee (Fast Desk)')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/finance/structures" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.feeStructures', 'Fee Structures')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/finance/transactions" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.receipts', 'Receipts & Transactions')}</span>
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        {/* EXAMINATIONS & RESULTS */}
        {sectionHeading(t('nav.examsResults', 'Examinations & Results'))}
        <div>
          <button
            onClick={() => setExamsOpen(!examsOpen)}
            className={accordionBtnClass(examsOpen, isExamsActive)}
          >
            <div className="flex items-center gap-3">
              <Layers
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isExamsActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.examEngine', 'MP Examination Engine')}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                examsOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
              }`}
            />
          </button>
          {examsOpen && (
            <div className="mt-1 ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-0.5">
              <NavLink to="/examinations" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{isHindi ? 'परीक्षा सेटअप (Exam Setup)' : 'Examination Setup'}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/examinations/schedule" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{isHindi ? 'परीक्षा समय-सारणी (Exam Schedule)' : 'Exam Timetable / Schedule'}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/examinations/schemes" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.schemesRules', 'MP Schemes & Rules')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/examinations/marks-entry" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.marksEntry', 'Marks Entry (Spreadsheet)')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/results/approval" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.resultsApproval', 'Results Approval Flow')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/results/published" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.publishedMarksheets', 'Published Marksheets')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/external-results" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.boardExternal', 'Board External (5, 8, 10)')}</span>
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        {/* SERVICES & PORTALS */}
        {sectionHeading(t('nav.servicesPortals', 'Services & Portals'))}
        <NavLink to="/communication" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <Bell
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.noticeBoard', 'Notice Board & Alerts')}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/certificates" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <FileText
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.certificateStudio', 'Certificate Studio (TC)')}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/parent/portal" end className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full shadow-xs" />
              )}
              <Home
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.parentPortal', 'Parent / Student Portal')}</span>
            </>
          )}
        </NavLink>

        <NavLink to="/public/search" target="_blank" className={mainNavItemClass}>
          {({ isActive }) => (
            <>
              <Search
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="flex items-center gap-1.5">
                <span>{t('nav.publicSearch', 'Public Verification')}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">↗</span>
              </span>
            </>
          )}
        </NavLink>

        {/* ADMINISTRATION */}
        {sectionHeading(t('nav.administration', 'Administration'))}
        <div>
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className={accordionBtnClass(adminOpen, isAdminActive)}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck
                className={`w-4.5 h-4.5 transition-colors duration-150 ${
                  isAdminActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{t('nav.administration', 'System Administration')}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                adminOpen ? 'rotate-180 text-slate-600 dark:text-slate-300' : ''
              }`}
            />
          </button>
          {adminOpen && (
            <div className="mt-1 ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-0.5">
              <NavLink to="/admin/users" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.usersAccess', 'Users & Access Control')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/admin/audit" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.auditLogs', 'Audit Logs')}</span>
                  </span>
                )}
              </NavLink>
              <NavLink to="/admin/settings" end className={subNavItemClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span>{t('nav.schoolSettings', 'School Settings')}</span>
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Footer System Status Card */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0a0f1a]/80">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                MP Board Portal
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                v2.4 • Session 25-26
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
