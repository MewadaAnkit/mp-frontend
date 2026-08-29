import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Award,
  Bell,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ParentPortal() {
  const { currentSession } = useAcademic();
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [child360, setChild360] = useState(null);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyChildren();
  }, [currentSession]);

  const fetchFamilyChildren = async () => {
    try {
      setLoading(true);
      // Fetch sample active students for multi-child switcher demo
      const res = await api.get('/students');
      if (res.data.success && res.data.data.length > 0) {
        setChildrenList(res.data.data);
        loadChildDetails(res.data.data[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  const loadChildDetails = async (studentId) => {
    try {
      const [pRes, hwRes] = await Promise.all([
        api.get(`/students/${studentId}/360`),
        api.get(`/homework?session=${currentSession?.sessionName || '2025-26'}`)
      ]);
      if (pRes.data.success) setChild360(pRes.data.data);
      if (hwRes.data.success) setHomeworkList(hwRes.data.data.slice(0, 4));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChild = (index) => {
    setSelectedChildIndex(index);
    if (childrenList[index]) {
      loadChildDetails(childrenList[index]._id);
    }
  };

  const child = child360?.student || childrenList[selectedChildIndex];
  const fee = child360?.fee;
  const attendance = child360?.attendance;
  const results = child360?.results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Parent & Student Portal
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Access daily attendance, homework tasks, fee balance, timetable, and examination report cards
          </p>
        </div>
      </div>

      {/* Multi-Child Selector Switcher */}
      {childrenList.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pl-3">
            Select Child:
          </span>
          {childrenList.map((ch, idx) => (
            <button
              key={ch._id}
              onClick={() => handleSelectChild(idx)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedChildIndex === idx
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/20 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-[10px]">
                {ch.studentName?.charAt(0)}
              </div>
              <span>{ch.studentName}</span>
              <span className="text-[10px] text-slate-400">Class {ch.currentClass}-{ch.currentSection}</span>
            </button>
          ))}
        </div>
      )}

      {child && (
        <>
          {/* Child KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget
              title="Attendance Rate"
              value={`${attendance?.attendanceRate || 95}%`}
              subtitle={`${attendance?.presentCount || 1} days present`}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatWidget
              title="Pending Fee Dues"
              value={`₹${fee?.ledger?.balanceAmount?.toLocaleString('en-IN') || 0}`}
              subtitle={`Status: ${fee?.ledger?.status || 'PENDING'}`}
              icon={CreditCard}
              color="amber"
            />
            <StatWidget
              title="Active Homework"
              value={homeworkList.length}
              subtitle="Tasks due this week"
              icon={BookOpen}
              color="purple"
            />
            <StatWidget
              title="Recent Exam Result"
              value={results && results.length > 0 ? `${results[0].percentage}%` : 'Awaiting'}
              subtitle={results && results.length > 0 ? `Status: ${results[0].finalResultStatus}` : 'Term Exam'}
              icon={Award}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Homework Feed */}
            <div className="lg:col-span-2 app-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>Pending Homework & Daily Tasks</span>
                </h3>
              </div>

              {homeworkList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No pending homework assignments.</p>
              ) : (
                <div className="space-y-3">
                  {homeworkList.map((hw) => (
                    <div
                      key={hw._id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded">
                          {hw.subjectName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Due: {new Date(hw.dueDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{hw.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{hw.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Fee Summary Card */}
            <div className="app-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>School Fee Summary</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Annual Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{fee?.ledger?.totalFee?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid Amount:</span>
                  <span className="font-bold text-emerald-600">₹{fee?.ledger?.paidAmount?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-black text-sm">
                  <span>Balance Dues:</span>
                  <span className="text-rose-600 dark:text-rose-400">₹{fee?.ledger?.balanceAmount?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>

              {fee?.payments && fee.payments.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Latest Payment</p>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300 font-mono">{fee.payments[0].receiptNo}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Paid ₹{fee.payments[0].amountPaid} via {fee.payments[0].paymentMode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
