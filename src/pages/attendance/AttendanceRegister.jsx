import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Save,
  Clock,
  AlertCircle,
  Sparkles,
  Check,
  X,
  UserX,
  FileCheck
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function AttendanceRegister() {
  const { currentSession, classes } = useAcademic();
  const { t, isHindi } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [records, setRecords] = useState([]);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [takenByName, setTakenByName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [currentSession, selectedClass, selectedSection, selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/attendance/daily?session=${currentSession?.sessionName || '2025-26'}&className=${selectedClass}&sectionName=${selectedSection}&date=${selectedDate}`
      );
      if (res.data.success) {
        setAlreadyMarked(res.data.alreadyMarked);
        setRecords(res.data.data.records || []);
        setTakenByName(res.data.data.takenByName || '');
      }
    } catch (err) {
      toast.error('Failed to load attendance list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (index, status) => {
    const updated = [...records];
    updated[index].status = status;
    setRecords(updated);
  };

  const handleMarkAllPresent = () => {
    const updated = records.map((r) => ({ ...r, status: 'PRESENT' }));
    setRecords(updated);
    toast.success('All students marked as Present');
  };

  const handleMarkAllAbsent = () => {
    const updated = records.map((r) => ({ ...r, status: 'ABSENT' }));
    setRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (!records.length) {
      toast.error('No students to mark');
      return;
    }
    try {
      setSaving(true);
      const res = await api.post('/attendance/daily', {
        academicSession: currentSession?.sessionName || '2025-26',
        className: selectedClass,
        sectionName: selectedSection,
        date: selectedDate,
        records
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setAlreadyMarked(true);
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE' || r.status === 'HALF_DAY').length;
  const attendanceRate = records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : '100.0';

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNo.toString().includes(search) ||
      r.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('attendance.title', 'Daily Attendance Register')}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('attendance.subtitle', 'High-speed single-click student attendance marking and daily tracking')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {alreadyMarked && (
            <Badge variant="success" size="sm" pulse>
              {t('attendance.attendanceSubmitted', 'Attendance Submitted')}
            </Badge>
          )}
          <button
            onClick={handleSaveAttendance}
            disabled={saving || !records.length}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? t('common.loading', 'Saving...') : t('attendance.saveAttendance', 'Save Attendance')}</span>
          </button>
        </div>
      </div>

      {/* Selector & Actions Bar */}
      <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {t('common.class', 'Class')}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="app-select text-xs font-bold min-w-[110px]"
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                <option key={c} value={c}>
                  {isHindi ? `कक्षा ${c}` : `Class ${c}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {t('common.section', 'Section')}
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="app-select text-xs font-bold min-w-[90px]"
            >
              {['A', 'B', 'C', 'D'].map((s) => (
                <option key={s} value={s}>
                  {isHindi ? `वर्ग ${s}` : `Sec ${s}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {t('common.date', 'Date')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="app-input text-xs font-bold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('attendance.markAllPresent', 'Mark All Present')}</span>
          </button>

          <button
            onClick={handleMarkAllAbsent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 transition cursor-pointer"
          >
            <UserX className="w-4 h-4" />
            <span>{t('attendance.markAllAbsent', 'Mark All Absent')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatWidget title={t('attendance.presentToday', 'Present Today')} value={presentCount} subtitle={`${attendanceRate}% ${isHindi ? 'उपस्थिति दर' : 'Attendance Rate'}`} color="emerald" />
        <StatWidget title={t('attendance.absentToday', 'Absent Today')} value={absentCount} subtitle={isHindi ? 'अनुपस्थित छात्र' : 'Students absent'} color="rose" />
        <StatWidget title={t('attendance.lateHalfDay', 'Late / Half-Day')} value={lateCount} subtitle={isHindi ? 'देरी से आने वाले' : 'Late arrivals'} color="amber" />
        <StatWidget title={t('attendance.totalEnrolled', 'Total Enrolled')} value={records.length} subtitle={`${isHindi ? 'कक्षा' : 'Class'} ${selectedClass}-${selectedSection}`} color="blue" />
      </div>

      {/* Attendance Grid */}
      <div className="app-card overflow-hidden">
        {/* Search inside list */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131b2e]/40 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or roll..."
              className="app-input pl-9 w-full text-xs"
            />
          </div>
          {takenByName && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              Marked By: <strong className="text-slate-700 dark:text-slate-300">{takenByName}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={4} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Users}
            title={`No students found in Class ${selectedClass}-${selectedSection}`}
            description="Ensure students are enrolled in this class and academic session."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                  <th className="py-3 px-4 w-16">Roll</th>
                  <th className="py-3 px-4">Student Name & Admission No</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredRecords.map((r, i) => (
                  <tr key={r.student} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                      {r.rollNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{r.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Adm: {r.admissionNo}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map((statusOption) => {
                          const isSelected = r.status === statusOption;
                          const colorClasses = {
                            PRESENT: isSelected
                              ? 'bg-emerald-600 text-white font-extrabold shadow-xs shadow-emerald-500/30'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                            ABSENT: isSelected
                              ? 'bg-rose-600 text-white font-extrabold shadow-xs shadow-rose-500/30'
                              : 'hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                            LATE: isSelected
                              ? 'bg-amber-500 text-white font-extrabold shadow-xs shadow-amber-500/30'
                              : 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                            LEAVE: isSelected
                              ? 'bg-purple-600 text-white font-extrabold shadow-xs shadow-purple-500/30'
                              : 'hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                          };

                          return (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() => handleStatusChange(i, statusOption)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                colorClasses[statusOption]
                              }`}
                            >
                              {statusOption}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={r.remarks || ''}
                        onChange={(e) => {
                          const updated = [...records];
                          updated[i].remarks = e.target.value;
                          setRecords(updated);
                        }}
                        placeholder="Optional remarks..."
                        className="app-input text-xs w-full py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
