import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Layers,
  Award,
  Bell,
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  Sparkles,
  Home,
  Receipt,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t, isHindi } = useLanguage();

  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [examsOpen, setExamsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const mainNavItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.2 rounded-xl text-xs font-bold transition-all duration-150 outline-none select-none ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-extrabold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-1.8 rounded-xl text-xs font-semibold transition-all duration-150 outline-none select-none ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-extrabold shadow-2xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`;

  const sectionHeading = (title) => (
    <p className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {title}
    </p>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 ease-in-out select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight tracking-tight">
              {t('common.appName', 'MP SCHOOL ERP')}
            </h1>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{t('common.subtitle', 'Full Academic Suite')}</span>
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          <NavLink to="/" end className={mainNavItemClass}>
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            <span>{t('nav.overview', 'Overview Dashboard')}</span>
          </NavLink>

          {/* MAIN MODULES */}
          {sectionHeading(t('nav.coreLifecycle', 'Core Lifecycle'))}

          <NavLink to="/admissions" end className={mainNavItemClass}>
            <UserPlus className="w-4 h-4 text-cyan-500" />
            <span>{t('nav.admissions', 'Admissions Pipeline')}</span>
          </NavLink>

          {/* Students Accordion */}
          <div>
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-sky-500" />
                <span>{t('nav.students', 'Student Management')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${studentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {studentsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5">
                <NavLink to="/students" end className={subNavItemClass}>
                  <span>{t('nav.studentDirectory', 'Student Directory (360°)')}</span>
                </NavLink>
                <NavLink to="/students/promotion" end className={subNavItemClass}>
                  <span>{t('nav.studentPromotion', 'Session Promotion')}</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/staff" end className={mainNavItemClass}>
            <Briefcase className="w-4 h-4 text-emerald-500" />
            <span>{t('nav.staff', 'Staff & Teachers')}</span>
          </NavLink>

          {sectionHeading(t('nav.dailyOps', 'Daily Operations'))}

          <NavLink to="/attendance" end className={mainNavItemClass}>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>{t('nav.attendance', 'Attendance Register')}</span>
          </NavLink>

          <NavLink to="/timetable" end className={mainNavItemClass}>
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span>{t('nav.timetable', 'Class Timetable')}</span>
          </NavLink>

          <NavLink to="/homework" end className={mainNavItemClass}>
            <BookOpen className="w-4 h-4 text-violet-500" />
            <span>{t('nav.homework', 'Homework & Tasks')}</span>
          </NavLink>

          {/* Academic Setup Accordion */}
          <div>
            <button
              onClick={() => setAcademicsOpen(!academicsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <School className="w-4 h-4 text-amber-500" />
                <span>{t('nav.academicSetup', 'Academic Setup')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${academicsOpen ? 'rotate-180' : ''}`} />
            </button>
            {academicsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5">
                <NavLink to="/academic/sessions" end className={subNavItemClass}>
                  <span>{t('nav.sessions', 'Academic Sessions')}</span>
                </NavLink>
                <NavLink to="/academic/classes" end className={subNavItemClass}>
                  <span>{t('nav.classesSections', 'Classes & Sections')}</span>
                </NavLink>
                <NavLink to="/academic/subjects" end className={subNavItemClass}>
                  <span>{t('nav.subjects', 'Subjects Master')}</span>
                </NavLink>
                <NavLink to="/academic/combinations" end className={subNavItemClass}>
                  <span>{t('nav.subjectStreams', 'Subject Streams (11/12)')}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* FINANCE & FEES */}
          {sectionHeading(t('nav.feesFinance', 'Fees & Finance'))}
          <div>
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>{t('nav.feeCounter', 'Fee Counter & Ledger')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${financeOpen ? 'rotate-180' : ''}`} />
            </button>
            {financeOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5">
                <NavLink to="/finance/collect" end className={subNavItemClass}>
                  <span>{t('nav.collectFee', 'Collect Fee (Fast Desk)')}</span>
                </NavLink>
                <NavLink to="/finance/structures" end className={subNavItemClass}>
                  <span>{t('nav.feeStructures', 'Fee Structures')}</span>
                </NavLink>
                <NavLink to="/finance/transactions" end className={subNavItemClass}>
                  <span>{t('nav.receipts', 'Receipts & Transactions')}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* EXAMINATIONS & RESULTS */}
          {sectionHeading(t('nav.examsResults', 'Examinations & Results'))}
          <div>
            <button
              onClick={() => setExamsOpen(!examsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>{t('nav.examEngine', 'MP Examination Engine')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${examsOpen ? 'rotate-180' : ''}`} />
            </button>
            {examsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5">
                <NavLink to="/examinations/schemes" end className={subNavItemClass}>
                  <span>{t('nav.schemesRules', 'MP Schemes & Rules')}</span>
                </NavLink>
                <NavLink to="/examinations" end className={subNavItemClass}>
                  <span>{t('nav.examSchedules', 'Exam Schedules')}</span>
                </NavLink>
                <NavLink to="/examinations/marks-entry" end className={subNavItemClass}>
                  <span>{t('nav.marksEntry', 'Marks Entry (Spreadsheet)')}</span>
                </NavLink>
                <NavLink to="/results/approval" end className={subNavItemClass}>
                  <span>{t('nav.resultsApproval', 'Results Approval Flow')}</span>
                </NavLink>
                <NavLink to="/results/published" end className={subNavItemClass}>
                  <span>{t('nav.publishedMarksheets', 'Published Marksheets')}</span>
                </NavLink>
                <NavLink to="/external-results" end className={subNavItemClass}>
                  <span>{t('nav.boardExternal', 'Board External (5, 8, 10)')}</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* COMMUNICATION & CERTIFICATES */}
          {sectionHeading(t('nav.servicesPortals', 'Services & Portals'))}
          <NavLink to="/communication" end className={mainNavItemClass}>
            <Bell className="w-4 h-4 text-amber-500" />
            <span>{t('nav.noticeBoard', 'Notice Board & Alerts')}</span>
          </NavLink>

          <NavLink to="/certificates" end className={mainNavItemClass}>
            <FileText className="w-4 h-4 text-rose-500" />
            <span>{t('nav.certificateStudio', 'Certificate Studio (TC)')}</span>
          </NavLink>

          <NavLink to="/parent/portal" end className={mainNavItemClass}>
            <Home className="w-4 h-4 text-teal-500" />
            <span>{t('nav.parentPortal', 'Parent / Student Portal')}</span>
          </NavLink>

          <NavLink to="/public/search" target="_blank" className={mainNavItemClass}>
            <Search className="w-4 h-4 text-blue-500" />
            <span>{t('nav.publicSearch', 'Public Results Verification')}</span>
          </NavLink>

          {/* ADMINISTRATION */}
          {sectionHeading(t('nav.administration', 'Administration'))}
          <div>
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>{t('nav.administration', 'System Administration')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`} />
            </button>
            {adminOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3.5">
                <NavLink to="/admin/users" end className={subNavItemClass}>
                  <span>{t('nav.usersAccess', 'Users & Access Control')}</span>
                </NavLink>
                <NavLink to="/admin/audit" end className={subNavItemClass}>
                  <span>{t('nav.auditLogs', 'Audit Logs')}</span>
                </NavLink>
                <NavLink to="/admin/settings" end className={subNavItemClass}>
                  <span>{t('nav.schoolSettings', 'School Settings')}</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d16]/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ERP v2.0
          </span>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
            {isHindi ? 'म.प्र. बोर्ड' : 'MP Board'}
          </span>
        </div>
      </div>
    </aside>
  );
}
