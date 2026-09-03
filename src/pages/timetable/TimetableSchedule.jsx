import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  BookOpen,
  User,
  MapPin,
  Coffee,
  Trash2,
  Printer,
  Sparkles,
  Table,
  LayoutGrid,
  Edit,
  Zap,
  Check,
  RotateCcw,
  Settings2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TimetableSchedule() {
  const { currentSession, classes, subjects: contextSubjects } = useAcademic();
  const { t, isHindi } = useLanguage();

  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [timetableData, setTimetableData] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'table' (default) or 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({
    periodNumber: 1,
    startTime: '08:30',
    endTime: '09:15',
    subjectCode: '',
    subjectName: '',
    teacherName: '',
    roomNo: 'Room 101',
    isBreak: false,
    isCustomSubject: false
  });

  // Auto-Generator State
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [autoStep, setAutoStep] = useState('FORM'); // 'FORM' | 'PREVIEW'
  const [generating, setGenerating] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoPreviewWeek, setAutoPreviewWeek] = useState([]);
  const [previewDay, setPreviewDay] = useState('MONDAY');
  const [autoForm, setAutoForm] = useState({
    targetClass: '9',
    targetSection: 'A',
    applyAllSections: false,
    schoolStartTime: '08:00',
    schoolEndTime: '14:00',
    periodDuration: 45,
    recessStartTime: '11:00',
    recessDuration: 30,
    assemblyDuration: 0,
    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  });

  // Load teachers for faculty dropdown
  useEffect(() => {
    api.get('/staff')
      .then((res) => {
        if (res.data.success) setStaffList(res.data.data || []);
      })
      .catch(() => setStaffList([]));
  }, []);

  // Class applicable subjects for dropdown
  const classApplicableSubjects = useMemo(() => {
    if (!subjectsList || subjectsList.length === 0) return [];
    const filtered = subjectsList.filter((s) => {
      if (!s.applicableClasses || s.applicableClasses.length === 0) return true;
      return s.applicableClasses.includes(String(selectedClass).toUpperCase()) || s.applicableClasses.includes('ALL');
    });
    return filtered.length > 0 ? filtered : subjectsList;
  }, [subjectsList, selectedClass]);

  const days = [
    { id: 'MONDAY', label: isHindi ? 'सोमवार (Monday)' : 'Monday' },
    { id: 'TUESDAY', label: isHindi ? 'मंगलवार (Tuesday)' : 'Tuesday' },
    { id: 'WEDNESDAY', label: isHindi ? 'बुधवार (Wednesday)' : 'Wednesday' },
    { id: 'THURSDAY', label: isHindi ? 'गुरुवार (Thursday)' : 'Thursday' },
    { id: 'FRIDAY', label: isHindi ? 'शुक्रवार (Friday)' : 'Friday' },
    { id: 'SATURDAY', label: isHindi ? 'शनिवार (Saturday)' : 'Saturday' }
  ];

  // Keep subjects in sync safely
  useEffect(() => {
    if (contextSubjects && Array.isArray(contextSubjects) && contextSubjects.length > 0) {
      setSubjectsList(contextSubjects);
    } else {
      // Fallback direct load
      api.get('/subjects')
        .then((res) => {
          if (res.data.success) {
            setSubjectsList(res.data.data || []);
          }
        })
        .catch(() => {
          setSubjectsList([]);
        });
    }
  }, [contextSubjects]);

  useEffect(() => {
    fetchTimetable();
  }, [currentSession, selectedClass, selectedSection, selectedDay]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/timetable?session=${currentSession?.sessionName || '2025-26'}&className=${selectedClass}&sectionName=${selectedSection}&dayOfWeek=${selectedDay}`
      );
      if (res.data.success && res.data.data.length > 0) {
        setTimetableData(res.data.data[0].periods || []);
      } else {
        setTimetableData([]);
      }
    } catch (err) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    try {
      const existing = timetableData.filter((p) => p.periodNumber !== Number(periodForm.periodNumber));
      const updatedPeriods = [...existing, { ...periodForm, periodNumber: Number(periodForm.periodNumber) }];
      updatedPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

      const payload = {
        academicSession: currentSession?.sessionName || '2025-26',
        className: selectedClass,
        sectionName: selectedSection,
        dayOfWeek: selectedDay,
        periods: updatedPeriods
      };

      const res = await api.post('/timetable', payload);
      if (res.data.success) {
        toast.success(isHindi ? 'पीरियड स्लॉट सुरक्षित किया गया' : 'Period slot saved!');
        setModalOpen(false);
        setTimetableData(res.data.data.periods || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save period');
    }
  };

  const handleDeletePeriod = async (periodNum) => {
    if (!window.confirm(isHindi ? `पीरियड ${periodNum} को हटाएं?` : `Remove Period ${periodNum}?`)) return;

    try {
      const updatedPeriods = timetableData.filter((p) => p.periodNumber !== periodNum);
      const payload = {
        academicSession: currentSession?.sessionName || '2025-26',
        className: selectedClass,
        sectionName: selectedSection,
        dayOfWeek: selectedDay,
        periods: updatedPeriods
      };

      const res = await api.post('/timetable', payload);
      if (res.data.success) {
        toast.success(isHindi ? 'पीरियड हटा दिया गया' : 'Period removed');
        setTimetableData(res.data.data.periods || []);
      }
    } catch (err) {
      toast.error('Failed to remove period');
    }
  };

  const handleEditPeriod = (slot) => {
    setPeriodForm({
      periodNumber: slot.periodNumber,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectCode: slot.subjectCode || '',
      subjectName: slot.subjectName || '',
      teacherName: slot.teacherName || '',
      roomNo: slot.roomNo || 'Room 101',
      isBreak: !!slot.isBreak,
      isCustomSubject: false
    });
    setModalOpen(true);
  };

  // Auto-Generator Handlers
  const handleAutoGeneratePreview = async (e) => {
    if (e) e.preventDefault();
    try {
      setGenerating(true);
      const payload = {
        academicSession: currentSession?.sessionName || '2025-26',
        className: autoForm.targetClass,
        sectionName: autoForm.targetSection,
        schoolStartTime: autoForm.schoolStartTime,
        schoolEndTime: autoForm.schoolEndTime,
        periodDuration: Number(autoForm.periodDuration),
        recessStartTime: autoForm.recessStartTime,
        recessDuration: Number(autoForm.recessDuration),
        assemblyDuration: Number(autoForm.assemblyDuration),
        days: autoForm.days,
        saveImmediately: false
      };

      const res = await api.post('/timetable/auto-generate', payload);
      if (res.data.success && res.data.data?.length > 0) {
        setAutoPreviewWeek(res.data.data);
        setPreviewDay(res.data.data[0].dayOfWeek);
        setAutoStep('PREVIEW');
        toast.success(isHindi ? 'समय-सारणी प्रारूप तैयार हुआ! कृपया समीक्षा करें।' : 'Weekly timetable preview generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmSaveAutoTimetable = async () => {
    try {
      setSavingAuto(true);
      const targetSections = autoForm.applyAllSections
        ? (classes?.find(c => c.className === autoForm.targetClass)?.sections || ['A', 'B', 'C'])
        : [autoForm.targetSection];

      for (const sec of targetSections) {
        const payload = {
          academicSession: currentSession?.sessionName || '2025-26',
          className: autoForm.targetClass,
          sectionName: sec,
          schoolStartTime: autoForm.schoolStartTime,
          schoolEndTime: autoForm.schoolEndTime,
          periodDuration: Number(autoForm.periodDuration),
          recessStartTime: autoForm.recessStartTime,
          recessDuration: Number(autoForm.recessDuration),
          assemblyDuration: Number(autoForm.assemblyDuration),
          days: autoForm.days,
          saveImmediately: true
        };
        await api.post('/timetable/auto-generate', payload);
      }

      toast.success(isHindi ? 'समय-सारणी सफलतापूर्वक लागू और सुरक्षित कर दी गई!' : 'Weekly timetable applied & saved successfully!');
      setAutoModalOpen(false);
      setSelectedClass(autoForm.targetClass);
      setSelectedSection(autoForm.targetSection);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save generated timetable');
    } finally {
      setSavingAuto(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('timetable.title', 'Class Timetable & Schedule')}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('timetable.subtitle', 'Configure periods, faculty assignments, subject lecture slots, and room allocations')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#151d30] rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('timetable.printBtn', 'Print Timetable')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoForm((prev) => ({
                ...prev,
                targetClass: selectedClass,
                targetSection: selectedSection
              }));
              setAutoStep('FORM');
              setAutoPreviewWeek([]);
              setAutoModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isHindi ? 'स्वतः समय-सारणी बनाएं' : 'Auto-Generate Timetable'}</span>
          </button>

          <button
            onClick={() => {
              const defSub = classApplicableSubjects[0] || subjectsList[0];
              setPeriodForm({
                periodNumber: timetableData.length + 1,
                startTime: '08:30',
                endTime: '09:15',
                subjectCode: defSub?.subjectCode || defSub?.code || '',
                subjectName: defSub?.subjectName || defSub?.name || '',
                teacherName: '',
                roomNo: 'Room 101',
                isBreak: false,
                isCustomSubject: false
              });
              setModalOpen(true);
            }}
            className="app-btn-primary text-xs cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('timetable.addPeriodBtn', 'Add Period Slot')}</span>
          </button>
        </div>
      </div>

      {/* Selector Bar */}
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
        </div>

        {/* Day Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {days.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedDay === d.id
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Schedule Period Slots */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('common.loading', 'Loading schedule...')}
          </div>
        ) : timetableData.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={isHindi ? `कक्षा ${selectedClass}-${selectedSection} (${selectedDay}) के लिए कोई समय-सारणी नहीं बनी है` : `No periods scheduled for Class ${selectedClass}-${selectedSection} on ${selectedDay}`}
            description={isHindi ? 'कालखंड, विषय, शिक्षक एवं कक्ष संख्या जोड़ें।' : 'Add lecture periods, breaks, and teacher allocations.'}
            actionLabel={t('timetable.addPeriodBtn', 'Add Period Slot')}
            onAction={() => {
              setPeriodForm({
                periodNumber: 1,
                startTime: '08:30',
                endTime: '09:15',
                subjectCode: '',
                subjectName: (subjectsList[0]?.name) || 'Mathematics',
                teacherName: '',
                roomNo: 'Room 101',
                isBreak: false
              });
              setModalOpen(true);
            }}
          />
        ) : (
          <>
            {/* Table View (Default) */}
            {viewMode === 'table' && (
              <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 w-28 text-center">{isHindi ? 'पीरियड' : 'Period'}</th>
                        <th className="py-3.5 px-4 w-40">{isHindi ? 'समय (Time Slot)' : 'Time Slot'}</th>
                        <th className="py-3.5 px-4 min-w-[200px]">{isHindi ? 'विषय (Subject)' : 'Subject'}</th>
                        <th className="py-3.5 px-4 min-w-[180px]">{isHindi ? 'शिक्षक (Faculty)' : 'Faculty / Teacher'}</th>
                        <th className="py-3.5 px-4 w-32">{isHindi ? 'कक्ष (Room)' : 'Room'}</th>
                        <th className="py-3.5 px-4 w-32">{isHindi ? 'प्रकार (Type)' : 'Type'}</th>
                        <th className="py-3.5 px-4 w-24 text-right">{isHindi ? 'कार्य' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                      {timetableData.map((slot) => {
                        if (slot.isBreak) {
                          return (
                            <tr key={slot.periodNumber} className="bg-amber-50/50 dark:bg-amber-950/20">
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                  <Coffee className="w-3 h-3" />
                                  <span>Break</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-amber-700 dark:text-amber-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-amber-900 dark:text-amber-300" colSpan={3}>
                                {isHindi ? 'मध्यांतर (Recess / Lunch Break)' : 'Recess / Lunch Break'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="app-badge-amber">Recess</span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePeriod(slot.periodNumber)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition cursor-pointer"
                                  title="Delete Break"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={slot.periodNumber} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            {/* Period # */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
                                #{slot.periodNumber}
                              </span>
                            </td>

                            {/* Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                            </td>

                            {/* Subject */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-white text-[13px] block">
                                  {slot.subjectName}
                                </span>
                                {slot.subjectCode && (
                                  <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                                    {slot.subjectCode}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Teacher */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                  {slot.teacherName || (isHindi ? 'विषय शिक्षक' : 'Faculty')}
                                </span>
                              </div>
                            </td>

                            {/* Room */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                <MapPin className="w-3 h-3 text-emerald-500" />
                                <span>{slot.roomNo || 'Room 101'}</span>
                              </span>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="app-badge-blue font-bold">
                                Academic
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditPeriod(slot)}
                                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                                  title="Edit Period Slot"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePeriod(slot.periodNumber)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                  title="Delete Period Slot"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cards View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timetableData.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <div
                        key={slot.periodNumber}
                        className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm">{isHindi ? 'मध्यांतर (Recess Break)' : 'Recess / Lunch Break'}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePeriod(slot.periodNumber)}
                          className="p-1.5 text-amber-600 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot.periodNumber}
                      className="app-card p-5 space-y-4 hover:border-blue-500/40 transition flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 mb-1">
                            {isHindi ? `पीरियड ${slot.periodNumber}` : `Period #${slot.periodNumber}`}
                          </span>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{slot.subjectName}</h3>
                          {slot.subjectCode && (
                            <p className="text-[11px] font-mono text-slate-400 font-bold">{slot.subjectCode}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditPeriod(slot)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                            title="Edit Period Slot"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(slot.periodNumber)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-bold">{slot.startTime} - {slot.endTime}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-purple-500" />
                          <span>{slot.teacherName || (isHindi ? 'विषय शिक्षक' : 'Faculty')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{slot.roomNo || 'Room 101'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: Add / Edit Period */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isHindi ? 'कालखंड / पीरियड जोड़ें' : 'Add Timetable Period Slot'}
        subtitle={`${isHindi ? 'कक्षा' : 'Class'} ${selectedClass}-${selectedSection} • ${selectedDay}`}
      >
        <form onSubmit={handleSavePeriod} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('timetable.periodNo', 'Period Number')} *
              </label>
              <input
                type="number"
                required
                min={1}
                max={12}
                value={periodForm.periodNumber}
                onChange={(e) => setPeriodForm({ ...periodForm, periodNumber: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('timetable.startTime', 'Start Time')} *
              </label>
              <input
                type="time"
                required
                value={periodForm.startTime}
                onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('timetable.endTime', 'End Time')} *
              </label>
              <input
                type="time"
                required
                value={periodForm.endTime}
                onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={periodForm.isBreak}
                onChange={(e) => setPeriodForm({ ...periodForm, isBreak: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>{t('timetable.recessBreak', 'This is a Recess / Lunch Break')}</span>
            </label>
          </div>

          {!periodForm.isBreak && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('timetable.subject', 'Subject')} *
                </label>
                {periodForm.isCustomSubject ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={periodForm.subjectName}
                      onChange={(e) => setPeriodForm({ ...periodForm, subjectName: e.target.value })}
                      placeholder="Type custom subject name..."
                      className="app-input w-full text-xs font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      title="Back to subject list"
                      onClick={() => setPeriodForm({ ...periodForm, isCustomSubject: false })}
                      className="w-8 h-8 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={periodForm.subjectCode || periodForm.subjectName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        setPeriodForm({ ...periodForm, isCustomSubject: true });
                        return;
                      }
                      const sub = (subjectsList || []).find(
                        (s) => (s.subjectCode || s.code) === val || (s.subjectName || s.name) === val || s._id === val
                      );
                      if (sub) {
                        setPeriodForm({
                          ...periodForm,
                          subjectName: sub.subjectName || sub.name || val,
                          subjectCode: sub.subjectCode || sub.code || ''
                        });
                      } else {
                        setPeriodForm({
                          ...periodForm,
                          subjectName: val,
                          subjectCode: ''
                        });
                      }
                    }}
                    className="app-select w-full text-xs font-bold"
                  >
                    <option value="">{isHindi ? '-- विषय चुनें --' : '-- Choose Subject --'}</option>
                    {classApplicableSubjects.length > 0 && (
                      <optgroup label={`Class ${selectedClass} Subjects`}>
                        {classApplicableSubjects.map((sub) => {
                          const name = sub.subjectName || sub.name || 'Subject';
                          const code = sub.subjectCode || sub.code || '';
                          return (
                            <option key={sub._id || code || name} value={code || name}>
                              {name} {code ? `(${code})` : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                    {subjectsList.length > classApplicableSubjects.length && (
                      <optgroup label="Other Classes Subjects">
                        {subjectsList
                          .filter((s) => !classApplicableSubjects.includes(s))
                          .map((sub) => {
                            const name = sub.subjectName || sub.name || 'Subject';
                            const code = sub.subjectCode || sub.code || '';
                            return (
                              <option key={sub._id || code || name} value={code || name}>
                                {name} {code ? `(${code})` : ''}
                              </option>
                            );
                          })}
                      </optgroup>
                    )}
                    <optgroup label="Custom">
                      <option value="__CUSTOM__">✏️ Custom Subject Name...</option>
                    </optgroup>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('timetable.teacherName', 'Teacher Name')}
                  </label>
                  {staffList && staffList.length > 0 ? (
                    <select
                      value={periodForm.teacherName}
                      onChange={(e) => setPeriodForm({ ...periodForm, teacherName: e.target.value })}
                      className="app-select w-full text-xs font-medium"
                    >
                      <option value="">-- Select Teacher (Optional) --</option>
                      {staffList.map((st) => (
                        <option key={st._id} value={st.fullName}>
                          {st.fullName} ({st.designation || 'Faculty'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={periodForm.teacherName}
                      onChange={(e) => setPeriodForm({ ...periodForm, teacherName: e.target.value })}
                      placeholder="e.g. Pooja Verma"
                      className="app-input w-full text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('timetable.roomLab', 'Room / Lab')}
                  </label>
                  <input
                    type="text"
                    value={periodForm.roomNo}
                    onChange={(e) => setPeriodForm({ ...periodForm, roomNo: e.target.value })}
                    placeholder="e.g. Room 101 / Lab 2"
                    className="app-input w-full text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="app-btn-secondary text-xs"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="app-btn-primary text-xs"
            >
              {t('common.save', 'Save Period Slot')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Auto-Generate Timetable Modal */}
      <Modal
        isOpen={autoModalOpen}
        onClose={() => {
          if (!generating && !savingAuto) setAutoModalOpen(false);
        }}
        title={
          autoStep === 'FORM'
            ? (isHindi ? '⚡ स्वतः समय-सारणी जनरेटर' : '⚡ Smart Class Timetable Generator')
            : (isHindi ? '📋 साप्ताहिक समय-सारणी पूर्वावलोकन' : '📋 Weekly Timetable Preview')
        }
        subtitle={
          autoStep === 'FORM'
            ? (isHindi ? 'कक्षा के खुलने, समाप्त होने एवं मध्यांतर का समय दर्ज करें' : 'Provide school opening, closing, and recess hours to auto-fill the entire week')
            : (isHindi ? 'आवंटित शिक्षकों व विषयों की जांच कर कक्षा में लागू करें' : 'Verify auto-balanced subject slots and faculty assignments before publishing')
        }
        maxWidth={autoStep === 'FORM' ? 'max-w-2xl' : 'max-w-4xl'}
      >
        {autoStep === 'FORM' ? (
          <form onSubmit={handleAutoGeneratePreview} className="space-y-5">
            {/* Target Class & Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('timetable.class', 'Target Class')} *
                </label>
                <select
                  value={autoForm.targetClass}
                  onChange={(e) => setAutoForm({ ...autoForm, targetClass: e.target.value })}
                  className="app-select w-full text-xs font-bold"
                >
                  {classes && classes.length > 0 ? (
                    classes.map((c) => (
                      <option key={c._id || c.className} value={c.className}>
                        Class {c.className}
                      </option>
                    ))
                  ) : (
                    ['9', '10', '11', '12'].map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('timetable.section', 'Section')} *
                </label>
                <select
                  disabled={autoForm.applyAllSections}
                  value={autoForm.targetSection}
                  onChange={(e) => setAutoForm({ ...autoForm, targetSection: e.target.value })}
                  className="app-select w-full text-xs font-bold disabled:opacity-50"
                >
                  {['A', 'B', 'C', 'D'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoForm.applyAllSections}
                    onChange={(e) => setAutoForm({ ...autoForm, applyAllSections: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>{isHindi ? 'इस कक्षा के सभी वर्गों (Sections) पर एक साथ लागू करें' : 'Generate & apply for all sections of this class'}</span>
                </label>
              </div>
            </div>

            {/* Timings Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {isHindi ? 'विद्यालय समय चक्र (School Shift & Timing)' : 'School Hours & Shift Timings'}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'विद्यालय प्रारंभ समय' : 'School Opening Time'} *
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.schoolStartTime}
                    onChange={(e) => setAutoForm({ ...autoForm, schoolStartTime: e.target.value })}
                    className="app-input w-full text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'विद्यालय समाप्ति समय' : 'School Closing Time'} *
                  </label>
                  <input
                    type="time"
                    required
                    value={autoForm.schoolEndTime}
                    onChange={(e) => setAutoForm({ ...autoForm, schoolEndTime: e.target.value })}
                    className="app-input w-full text-xs font-bold"
                  />
                </div>
              </div>

              {/* Period Duration & Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isHindi ? 'प्रति पीरियड अवधि (मिनट)' : 'Period Duration (Minutes)'} *
                    </label>
                    <div className="flex items-center gap-1">
                      {[40, 45, 50].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setAutoForm({ ...autoForm, periodDuration: dur })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            Number(autoForm.periodDuration) === dur
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="25"
                    max="90"
                    required
                    value={autoForm.periodDuration}
                    onChange={(e) => setAutoForm({ ...autoForm, periodDuration: e.target.value })}
                    className="app-input w-full text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'प्रातःकालीन सभा / जीरो पीरियड (मिनट)' : 'Morning Assembly / Zero Period (Mins)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={autoForm.assemblyDuration}
                    onChange={(e) => setAutoForm({ ...autoForm, assemblyDuration: e.target.value })}
                    className="app-input w-full text-xs"
                    placeholder="0 if none"
                  />
                </div>
              </div>
            </div>

            {/* Recess / Break Section */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  {isHindi ? 'मध्यांतर / लंच ब्रेक (Recess Break Settings)' : 'Recess / Lunch Break Settings'}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'मध्यांतर शुरू होने का समय' : 'Recess Start Time'}
                  </label>
                  <input
                    type="time"
                    value={autoForm.recessStartTime}
                    onChange={(e) => setAutoForm({ ...autoForm, recessStartTime: e.target.value })}
                    className="app-input w-full text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'मध्यांतर अवधि (मिनट)' : 'Recess Duration (Minutes)'}
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={autoForm.recessDuration}
                    onChange={(e) => setAutoForm({ ...autoForm, recessDuration: e.target.value })}
                    className="app-input w-full text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isHindi ? 'कार्य दिवस (Working Days)' : 'Operating Days of Week'}
              </label>
              <div className="flex flex-wrap gap-2">
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day) => {
                  const active = autoForm.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (active && autoForm.days.length === 1) return;
                        const nextDays = active
                          ? autoForm.days.filter((d) => d !== day)
                          : [...autoForm.days, day];
                        setAutoForm({ ...autoForm, days: nextDays });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{day.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intelligence Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                {isHindi
                  ? 'जनरेटर स्वचालित रूप से डेटाबेस से विषय और आवंटित शिक्षकों को लोड करेगा और मुख्य विषयों को पूरे सप्ताह समान रूप से वितरित करेगा।'
                  : 'The generator will automatically map subjects, fetch designated faculty from Teacher Allocation, and balance core and co-curricular subjects across the week.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAutoModalOpen(false)}
                className="app-btn-secondary text-xs"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isHindi ? 'समय-सारणी बन रही है...' : 'Generating Slots...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isHindi ? 'पूर्वावलोकन देखें' : 'Generate & Preview'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* PREVIEW STEP */
          <div className="space-y-4">
            {/* Header / Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-500">
                  Target:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    Class {autoForm.targetClass}-{autoForm.applyAllSections ? 'ALL' : autoForm.targetSection}
                  </strong>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {autoForm.schoolStartTime} - {autoForm.schoolEndTime} • {autoForm.periodDuration}m periods • Recess at {autoForm.recessStartTime}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoStep('FORM')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Adjust Settings</span>
                </button>
              </div>
            </div>

            {/* Day Selector Tabs in Preview */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
              {autoPreviewWeek.map((dayData) => {
                const isActive = previewDay === dayData.dayOfWeek;
                return (
                  <button
                    key={dayData.dayOfWeek}
                    type="button"
                    onClick={() => setPreviewDay(dayData.dayOfWeek)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {dayData.dayOfWeek} ({dayData.periods?.length || 0})
                  </button>
                );
              })}
            </div>

            {/* Periods Preview Table */}
            {(() => {
              const activeDayData = autoPreviewWeek.find((d) => d.dayOfWeek === previewDay) || autoPreviewWeek[0];
              const periods = activeDayData?.periods || [];

              return (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-[#151d30] text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3 w-16">Slot</th>
                        <th className="py-2.5 px-3 w-32">Time</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Teacher Allocated</th>
                        <th className="py-2.5 px-3 w-28">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {periods.map((p, idx) => {
                        if (p.isBreak) {
                          return (
                            <tr key={idx} className="bg-amber-500/10 dark:bg-amber-500/15">
                              <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-400">
                                <Coffee className="w-4 h-4 inline mr-1" />
                              </td>
                              <td className="py-2.5 px-3 font-bold text-amber-800 dark:text-amber-300">
                                {p.startTime} - {p.endTime}
                              </td>
                              <td colSpan={3} className="py-2.5 px-3 font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                {p.subjectName} ({autoForm.recessDuration} mins)
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-black text-slate-400">
                              #{p.periodNumber}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                              {p.startTime} - {p.endTime}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {p.subjectName}
                                </span>
                                {p.subjectCode && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {p.subjectCode}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={p.teacherName || ''}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  setAutoPreviewWeek((prev) =>
                                    prev.map((dayObj) => {
                                      if (dayObj.dayOfWeek !== previewDay) return dayObj;
                                      const updatedPeriods = [...dayObj.periods];
                                      updatedPeriods[idx] = { ...updatedPeriods[idx], teacherName: newName };
                                      return { ...dayObj, periods: updatedPeriods };
                                    })
                                  );
                                }}
                                className="app-select py-1 px-2 text-xs font-semibold w-full max-w-[210px] bg-white dark:bg-slate-900"
                              >
                                <option value="">-- Unassigned --</option>
                                {staffList.map((st) => (
                                  <option key={st._id} value={st.fullName}>
                                    {st.fullName} {st.cadre ? `(${st.cadre})` : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                              {p.roomNo}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAutoStep('FORM')}
                className="app-btn-secondary text-xs"
              >
                ← Back to Parameters
              </button>

              <button
                type="button"
                disabled={savingAuto}
                onClick={handleConfirmSaveAutoTimetable}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {savingAuto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Schedule to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply & Save Timetable to Class</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
