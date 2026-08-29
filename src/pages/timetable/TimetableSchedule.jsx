import React, { useState, useEffect } from 'react';
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
  Sparkles
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
  const [loading, setLoading] = useState(true);

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
    isBreak: false
  });

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('timetable.printBtn', 'Print Timetable')}</span>
          </button>
          <button
            onClick={() => {
              setPeriodForm({
                periodNumber: timetableData.length + 1,
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
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
                    <button
                      onClick={() => handleDeletePeriod(slot.periodNumber)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  {t('common.name', 'Subject')} *
                </label>
                <select
                  required
                  value={periodForm.subjectName}
                  onChange={(e) => {
                    const sub = (subjectsList || []).find((s) => s.name === e.target.value);
                    setPeriodForm({
                      ...periodForm,
                      subjectName: e.target.value,
                      subjectCode: sub ? sub.code : ''
                    });
                  }}
                  className="app-select w-full text-xs font-bold"
                >
                  <option value="">{isHindi ? '-- विषय चुनें --' : '-- Choose Subject --'}</option>
                  {(subjectsList || []).map((sub) => (
                    <option key={sub._id || sub.code || sub.name} value={sub.name}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))}
                  {(!subjectsList || subjectsList.length === 0) && (
                    <>
                      <option value="Hindi">Hindi (101)</option>
                      <option value="English">English (102)</option>
                      <option value="Sanskrit">Sanskrit (103)</option>
                      <option value="Mathematics">Mathematics (201)</option>
                      <option value="Science">Science (202)</option>
                      <option value="Social Science">Social Science (203)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('timetable.teacherName', 'Teacher Name')}
                  </label>
                  <input
                    type="text"
                    value={periodForm.teacherName}
                    onChange={(e) => setPeriodForm({ ...periodForm, teacherName: e.target.value })}
                    placeholder="e.g. Pooja Verma"
                    className="app-input w-full text-xs"
                  />
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {t('common.save', 'Save Period Slot')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
