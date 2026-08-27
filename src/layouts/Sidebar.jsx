import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  School,
  BookOpen,
  Users,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2,
  Award,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  Layers,
  FileCheck,
  Search,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [academicOpen, setAcademicOpen] = useState(true);
  const [studentsOpen, setStudentsOpen] = useState(true);
  const [examsOpen, setExamsOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const mainNavItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 outline-none focus:outline-none ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-extrabold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 outline-none focus:outline-none ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-extrabold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800/80 transition-transform duration-300 ease-in-out select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight tracking-tight">MP RMS PORTAL</h1>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>MP Board Engine</span>
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <NavLink to="/" end className={mainNavItemClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* Academic Setup Accordion */}
          <div>
            <button
              onClick={() => setAcademicOpen(!academicOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Academic Setup</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${academicOpen ? 'rotate-180' : ''}`} />
            </button>
            {academicOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1">
                <NavLink to="/academic/sessions" end className={subNavItemClass}>
                  <span>Academic Sessions</span>
                </NavLink>
                <NavLink to="/academic/classes" end className={subNavItemClass}>
                  <span>Classes & Sections</span>
                </NavLink>
                <NavLink to="/academic/subjects" end className={subNavItemClass}>
                  <span>Subjects List</span>
                </NavLink>
                <NavLink to="/academic/combinations" end className={subNavItemClass}>
                  <span>Subject Combinations (11th)</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Students Accordion */}
          <div>
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Students</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${studentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {studentsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1">
                <NavLink to="/students" end className={subNavItemClass}>
                  <span>Student Directory</span>
                </NavLink>
                <NavLink to="/students/promotion" end className={subNavItemClass}>
                  <span>Student Promotion</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Examination & Schemes */}
          <div>
            <button
              onClick={() => setExamsOpen(!examsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Examinations</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${examsOpen ? 'rotate-180' : ''}`} />
            </button>
            {examsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1">
                <NavLink to="/examinations/schemes" end className={subNavItemClass}>
                  <span>Scheme Engine & Rules</span>
                </NavLink>
                <NavLink to="/examinations" end className={subNavItemClass}>
                  <span>Exam Schedules</span>
                </NavLink>
                <NavLink to="/examinations/marks-entry" end className={subNavItemClass}>
                  <span>Marks Entry (Grid/Bulk)</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Results & Approvals */}
          <div>
            <button
              onClick={() => setResultsOpen(!resultsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Results Pipeline</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${resultsOpen ? 'rotate-180' : ''}`} />
            </button>
            {resultsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1">
                <NavLink to="/results/approval" end className={subNavItemClass}>
                  <span>Approval Workflow</span>
                </NavLink>
                <NavLink to="/results/published" end className={subNavItemClass}>
                  <span>Published Marksheets</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* External Authority Mode */}
          <NavLink to="/external-results" end className={mainNavItemClass}>
            <FileCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Board / External (5, 8, 10)</span>
          </NavLink>

          {/* Public Search Portal Link */}
          <NavLink to="/public/search" target="_blank" className={mainNavItemClass}>
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Public Search Portal</span>
          </NavLink>

          {/* Administration Accordion */}
          <div>
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Administration</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`} />
            </button>
            {adminOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1">
                <NavLink to="/admin/users" end className={subNavItemClass}>
                  <span>Users & Access</span>
                </NavLink>
                <NavLink to="/admin/audit" end className={subNavItemClass}>
                  <span>Audit Logs</span>
                </NavLink>
                <NavLink to="/admin/settings" end className={subNavItemClass}>
                  <span>School Settings</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d16]/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MP RMS v1.0
            </span>
            <span className="text-[10px] text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
              MPBSE Pattern
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
