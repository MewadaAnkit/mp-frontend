import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import {
  Users,
  Award,
  FileCheck2,
  Clock,
  Sparkles,
  TrendingUp,
  School,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { currentSession, classes, settings } = useAcademic();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalPublishedResults: 0,
    pendingApprovalCount: 0
  });
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examAnalytics, setExamAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [globalRes, examsRes] = await Promise.all([
          api.get('/analytics'),
          api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`)
        ]);

        if (globalRes.data.success) {
          setStats(globalRes.data.data);
        }

        if (examsRes.data.success && examsRes.data.data.length > 0) {
          setExams(examsRes.data.data);
          setSelectedExamId(examsRes.data.data[0]._id);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentSession]);

  useEffect(() => {
    if (!selectedExamId) return;

    const loadExamAnalytics = async () => {
      try {
        const res = await api.get(`/analytics?examinationId=${selectedExamId}`);
        if (res.data.success) {
          setExamAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Error loading exam analytics:', err);
      }
    };

    loadExamAnalytics();
  }, [selectedExamId]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-[#0d1322] border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-sm app-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Madhya Pradesh School Result Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {settings?.schoolName || 'Government Excellence Higher Secondary School'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl font-medium">
              Academic Session {currentSession?.sessionName || '2025-26'} • Recognized by Board of Secondary Education, M.P. (MPBSE)
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/examinations/marks-entry" className="app-btn-primary">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Marks Entry</span>
            </Link>
            <Link to="/results/approval" className="app-btn-secondary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Approval Pipeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="app-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enrolled</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalStudents}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Across {classes.length} active classes
          </p>
        </div>

        <div className="app-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Exams</span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalExams}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Configured for {currentSession?.sessionName}</p>
        </div>

        <div className="app-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Published Marksheets</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalPublishedResults}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>QR Verified & Downloadable</span>
          </p>
        </div>

        <div className="app-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.pendingApprovalCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>In Teacher / Principal Stages</span>
          </p>
        </div>
      </div>

      {/* Examination Performance Analytics */}
      <div className="app-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Examination Performance Metrics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Detailed calculation metrics and distribution</p>
          </div>

          {exams.length > 0 ? (
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="app-input font-bold"
            >
              {exams.map(e => (
                <option key={e._id} value={e._id}>{e.examName} ({e.examCode})</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-500">No examinations created yet</span>
          )}
        </div>

        {examAnalytics && examAnalytics.totalEvaluated > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="app-card-subtle p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Evaluated</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{examAnalytics.totalEvaluated}</p>
              </div>
              <div className="app-card-subtle p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pass Percentage</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{examAnalytics.passPercentage}%</p>
              </div>
              <div className="app-card-subtle p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class Average</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{examAnalytics.classAverage}%</p>
              </div>
              <div className="app-card-subtle p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Highest Score</span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{examAnalytics.highestPercentage}%</p>
              </div>
            </div>

            {/* Grade Breakdown & Toppers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <div className="app-card-subtle p-5">
                <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-4">
                  MP Board Grade Distribution
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.entries(examAnalytics.gradeDistribution || {}).map(([grade, count]) => (
                    <div key={grade} className="app-card p-2.5 rounded-xl text-center">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{grade}</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="app-card-subtle p-5">
                <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-4">
                  Top Academic Performers
                </h3>
                <div className="space-y-2.5">
                  {examAnalytics.toppers && examAnalytics.toppers.length > 0 ? (
                    examAnalytics.toppers.map((t, idx) => (
                      <div key={idx} className="app-card px-3.5 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Roll: {t.rollNo} • Adm: {t.admissionNo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{t.percentage}%</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded font-bold text-[10px]">{t.grade}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No topper records yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center app-card-subtle rounded-2xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No results calculated yet for the selected examination. Head over to <Link to="/examinations/marks-entry" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Marks Entry</Link> and run calculation!
            </p>
          </div>
        )}
      </div>

      {/* Class Modes & Architecture Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="app-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
            <School className="w-4 h-4" />
            <span>School-Managed (Classes 1–4, 6–7)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Full school examination autonomy with dynamic assessment schemes, unit tests, half-yearly, and annual report cards.
          </p>
        </div>

        <div className="app-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase">
            <FileCheck2 className="w-4 h-4" />
            <span>Board / External (Classes 5, 8, 10)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            External authority result import & verification mode. Clearly marks state board declared results from local records.
          </p>
        </div>

        <div className="app-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase">
            <Award className="w-4 h-4" />
            <span>MP Academic & Streams (9, 11)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Flexible subject-wise theory/practical max marks (70/30, 80/20, 75/25) and customizable Science, Commerce, Arts tracks.
          </p>
        </div>
      </div>
    </div>
  );
}
