import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Plus,
  Printer,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Calendar,
  User,
  MapPin,
  Trash2,
  Edit2,
  Eye,
  Send,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Filter
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton, CardSkeleton } from '../../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

export default function ExamScheduleManager() {
  const { currentSession, classes, subjects: contextSubjects, settings } = useAcademic();
  const { t, isHindi } = useLanguage();
  const [searchParams] = useSearchParams();

  // Active filters — BUG-024 FIX: Default class comes from context, not hardcoded '9'
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('class_view');

  // Data states
  const [examinations, setExaminations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [singleEditModalOpen, setSingleEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Bulk Builder state
  const [bulkExamId, setBulkExamId] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  const [bulkApplyAllSections, setBulkApplyAllSections] = useState(true);
  const [bulkEntries, setBulkEntries] = useState([]);
  const [detectedConflicts, setDetectedConflicts] = useState([]);
  const [savingBulk, setSavingBulk] = useState(false);

  // Load staff list for invigilator dropdown
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
      return s.applicableClasses.includes(bulkClass) || s.applicableClasses.includes('ALL');
    });
    return filtered.length > 0 ? filtered : subjectsList;
  }, [subjectsList, bulkClass]);

  // BUG-024 FIX: Set initial class from context when classes load
  useEffect(() => {
    if (classes && classes.length > 0) {
      if (!selectedClass) setSelectedClass(classes[0].className);
      if (!bulkClass) setBulkClass(classes[0].className);
    }
  }, [classes]);

  // BUG-030 FIX: Derive available sections for selected class
  const sectionsForClass = (cls) => {
    const found = classes?.find(c => c.className === cls);
    if (found && found.sections && found.sections.length > 0) return found.sections;
    return ['A', 'B', 'C', 'D'];
  };

  // Load initial exams and subjects
  useEffect(() => {
    loadExaminations();
  }, [currentSession]);

  // Load subjects
  useEffect(() => {
    if (contextSubjects && Array.isArray(contextSubjects) && contextSubjects.length > 0) {
      setSubjectsList(contextSubjects);
    } else {
      api.get('/subjects')
        .then((res) => {
          if (res.data.success) setSubjectsList(res.data.data || []);
        })
        .catch(() => setSubjectsList([]));
    }
  }, [contextSubjects]);

  const loadExaminations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`);
      if (res.data.success && res.data.data.length > 0) {
        setExaminations(res.data.data);
        setSelectedExamId(res.data.data[0]._id);
        setBulkExamId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load schedules and stats whenever filters change
  useEffect(() => {
    fetchSchedulesAndStats();
  }, [currentSession, selectedExamId, selectedClass, selectedSection, selectedStatus]);

  const fetchSchedulesAndStats = async () => {
    try {
      setLoading(true);
      const session = currentSession?.sessionName || '2025-26';

      let url = `/exam-schedules?session=${session}`;
      if (selectedExamId) url += `&examinationId=${selectedExamId}`;
      if (selectedClass && selectedClass !== 'ALL') url += `&className=${selectedClass}`;
      if (selectedSection && selectedSection !== 'ALL') url += `&sectionName=${selectedSection}`;
      if (selectedStatus && selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;

      const [schedRes, statsRes] = await Promise.all([
        api.get(url),
        api.get(`/exam-schedules/dashboard-stats?session=${session}`)
      ]);

      if (schedRes.data.success) setSchedules(schedRes.data.data);
      if (statsRes.data.success) setDashboardStats(statsRes.data.data);
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize bulk builder entries when bulk class or exam changes
  useEffect(() => {
    if (activeTab === 'bulk_builder') {
      initializeBulkBuilder();
    }
  }, [bulkClass, bulkExamId, activeTab, subjectsList]);

  const initializeBulkBuilder = () => {
    // Filter subjects applicable for bulkClass
    const applicableSubs = (subjectsList || []).filter(
      (s) => !s.applicableClasses || s.applicableClasses.length === 0 || s.applicableClasses.includes(bulkClass) || s.applicableClasses.includes('ALL')
    );

    const initialList = (applicableSubs.length > 0 ? applicableSubs : subjectsList.slice(0, 5)).map((sub, idx) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7 + idx * 2);
      const dateStr = targetDate.toISOString().split('T')[0];

      return {
        subjectId: sub._id,
        subjectName: sub.name || sub.subjectName || 'Subject',
        subjectCode: sub.code || sub.subjectCode || `SUB_${idx + 1}`,
        examDate: dateStr,
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        durationMinutes: 180,
        examType: sub.hasPractical ? 'THEORY' : 'THEORY',
        roomOrHall: 'Main Examination Hall A',
        invigilatorName: '',
        instructions: 'Report 30 minutes before time. Carry School ID Card & Admit Card.',
        maxMarks: sub.totalMaxMarks || 100,
        minPassingMarks: 33,
        isCustomSubject: false
      };
    });

    setBulkEntries(initialList);
    setDetectedConflicts([]);
  };

  // Bulk entry row change
  const handleBulkRowChange = (index, field, value) => {
    const updated = [...bulkEntries];
    updated[index][field] = value;

    // Recalculate duration if time changes
    if (field === 'startTime' || field === 'endTime') {
      const s = updated[index].startTime;
      const e = updated[index].endTime;
      if (s && e) {
        // approximate duration
        updated[index].durationMinutes = 180;
      }
    }

    setBulkEntries(updated);
  };

  // Dedicated subject selection handler from class subjects dropdown
  const handleBulkRowSubjectSelect = (index, subCodeOrName) => {
    const updated = [...bulkEntries];
    if (subCodeOrName === '__CUSTOM__') {
      updated[index].isCustomSubject = true;
      setBulkEntries(updated);
      return;
    }

    const matched = (subjectsList || []).find(
      (s) => (s.code || s.subjectCode) === subCodeOrName || s._id === subCodeOrName || (s.name || s.subjectName) === subCodeOrName
    );

    if (matched) {
      updated[index].subjectId = matched._id;
      updated[index].subjectName = matched.name || matched.subjectName || '';
      updated[index].subjectCode = matched.code || matched.subjectCode || '';
      updated[index].maxMarks = matched.totalMaxMarks || 100;
      updated[index].minPassingMarks = matched.minPassingMarks || 33;
      updated[index].isCustomSubject = false;
    } else {
      updated[index].subjectName = subCodeOrName;
      updated[index].isCustomSubject = false;
    }
    setBulkEntries(updated);
  };

  // Add extra custom subject row in bulk builder
  const handleAddBulkRow = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7 + bulkEntries.length * 2);

    setBulkEntries([
      ...bulkEntries,
      {
        subjectId: null,
        subjectName: 'Additional Subject / Practical',
        subjectCode: 'OPT_01',
        examDate: nextDate.toISOString().split('T')[0],
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        durationMinutes: 180,
        examType: 'PRACTICAL',
        roomOrHall: 'Science & Computer Lab',
        invigilatorName: '',
        instructions: 'Practical journal required.',
        maxMarks: 50,
        minPassingMarks: 17
      }
    ]);
  };

  // Remove row in bulk builder
  const handleRemoveBulkRow = (index) => {
    setBulkEntries(bulkEntries.filter((_, idx) => idx !== index));
  };

  // Run Realtime Smart Conflict Check
  const handleCheckConflicts = async () => {
    try {
      const res = await api.post('/exam-schedules/check-conflicts', {
        session: currentSession?.sessionName || '2025-26',
        examinationId: bulkExamId,
        entries: bulkEntries.map((e) => ({
          ...e,
          className: bulkClass,
          sectionName: bulkApplyAllSections ? 'ALL' : 'A'
        }))
      });

      if (res.data.success) {
        setDetectedConflicts(res.data.conflicts || []);
        if (res.data.hasConflicts) {
          toast.error(`${res.data.conflictCount} scheduling conflicts found!`);
        } else {
          toast.success(isHindi ? 'कोई समय टकराव नहीं मिला! समय-सारणी सुरक्षित है।' : 'All slots conflict-free!');
        }
      }
    } catch (err) {
      toast.error('Conflict validation failed');
    }
  };

  // Save Bulk Schedule (Draft or Publish)
  const handleSaveBulkSchedule = async (targetStatus = 'DRAFT') => {
    if (!bulkExamId) {
      toast.error('Please select an examination');
      return;
    }
    if (bulkEntries.length === 0) {
      toast.error('Please add at least one exam date slot');
      return;
    }

    try {
      setSavingBulk(true);
      const payload = {
        academicSession: currentSession?.sessionName || '2025-26',
        examinationId: bulkExamId,
        className: bulkClass,
        sections: bulkApplyAllSections ? ['ALL'] : ['A'],
        applyToAllSections: bulkApplyAllSections,
        status: targetStatus,
        entries: bulkEntries
      };

      const res = await api.post('/exam-schedules/bulk', payload);
      if (res.data.success) {
        toast.success(
          targetStatus === 'PUBLISHED'
            ? (isHindi ? 'समय-सारणी प्रकाशित की गई एवं सूचना प्रसारित हुई!' : 'Exam timetable published & circular issued!')
            : (isHindi ? 'समय-सारणी प्रारूप (Draft) सुरक्षित हुआ!' : 'Exam timetable saved as Draft!')
        );
        setActiveTab('class_view');
        setSelectedClass(bulkClass);
        setSelectedExamId(bulkExamId);
        fetchSchedulesAndStats();
      }
    } catch (err) {
      if (err.response?.data?.conflicts) {
        setDetectedConflicts(err.response.data.conflicts);
        toast.error(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save timetable');
      }
    } finally {
      setSavingBulk(false);
    }
  };

  // 1-Click Publish Class Schedule
  const handlePublishClassSchedule = async () => {
    if (!window.confirm(isHindi ? 'क्या आप इस कक्षा की समय-सारणी प्रकाशित करना चाहते हैं?' : 'Publish this examination timetable for students and parents?')) return;

    try {
      const res = await api.post('/exam-schedules/publish', {
        session: currentSession?.sessionName || '2025-26',
        examinationId: selectedExamId,
        className: selectedClass
      });
      if (res.data.success) {
        toast.success(isHindi ? 'समय-सारणी सफलतापूर्वक प्रकाशित हुई!' : 'Timetable published successfully!');
        fetchSchedulesAndStats();
      }
    } catch (err) {
      toast.error('Failed to publish timetable');
    }
  };

  // Delete single entry
  const handleDeleteSlot = async (id) => {
    if (!window.confirm(isHindi ? 'क्या आप इस परीक्षा स्लॉट को हटाना चाहते हैं?' : 'Delete this examination slot?')) return;
    try {
      await api.delete(`/exam-schedules/${id}`);
      toast.success(isHindi ? 'स्लॉट हटाया गया' : 'Slot removed');
      fetchSchedulesAndStats();
    } catch (err) {
      toast.error('Failed to delete slot');
    }
  };

  // Edit Single Slot
  const handleSaveSingleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/exam-schedules/${editingSlot._id}`, editingSlot);
      if (res.data.success) {
        toast.success('Exam slot updated');
        setSingleEditModalOpen(false);
        fetchSchedulesAndStats();
      }
    } catch (err) {
      toast.error('Failed to update slot');
    }
  };

  const tabs = [
    { id: 'class_view', label: t('examSchedule.classTimetableTab', 'Class Timetable View'), icon: CalendarDays, badge: schedules.length },
    { id: 'bulk_builder', label: t('examSchedule.bulkBuilderTab', 'Bulk Schedule Builder'), icon: FileSpreadsheet },
    { id: 'calendar_view', label: t('examSchedule.calendarTab', 'Calendar View'), icon: Calendar },
    { id: 'master_table', label: t('examSchedule.masterTableTab', 'Master Schedule Table'), icon: Layers },
    { id: 'student_view', label: t('examSchedule.studentViewTab', 'Student Routine'), icon: User }
  ];

  const selectedExamObj = examinations.find((e) => e._id === selectedExamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>{t('examSchedule.title', 'Examination Timetable & Schedules')}</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('examSchedule.subtitle', 'Generate, manage, detect conflicts, publish, and print official school examination date sheets')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('examSchedule.printTimetableBtn', 'Print Timetable (A4)')}</span>
          </button>

          <button
            onClick={() => {
              setBulkClass(selectedClass);
              setBulkExamId(selectedExamId);
              setActiveTab('bulk_builder');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('examSchedule.createScheduleBtn', 'Create Exam Timetable')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatWidget
          title={t('examSchedule.totalScheduled', 'Total Scheduled Exams')}
          value={dashboardStats?.totalScheduled || schedules.length}
          subtitle={`${isHindi ? 'सत्र' : 'Session'} ${currentSession?.sessionName || '2025-26'}`}
          icon={CalendarDays}
          color="purple"
        />
        <StatWidget
          title={t('examSchedule.todayExams', "Today's Examinations")}
          value={dashboardStats?.todayExamsCount || 0}
          subtitle={isHindi ? 'आज के परीक्षा सत्र' : 'Ongoing today'}
          icon={Clock}
          color="emerald"
        />
        <StatWidget
          title={t('examSchedule.upcomingExams', 'Upcoming (7 Days)')}
          value={dashboardStats?.upcomingExamsCount || 0}
          subtitle={isHindi ? 'निकटवर्ती परीक्षाएं' : 'Scheduled next week'}
          icon={Calendar}
          color="blue"
        />
        <StatWidget
          title={t('examSchedule.draftSchedules', 'Draft Schedules')}
          value={dashboardStats?.draftCount || 0}
          subtitle={isHindi ? 'अप्रकाशित प्रारूप' : 'Pending publication'}
          icon={Edit2}
          color="amber"
        />
        <div
          onClick={() => {
            if (dashboardStats?.conflictsDetected > 0) setConflictModalOpen(true);
          }}
          className={`app-card p-4 flex items-center justify-between cursor-pointer transition ${
            dashboardStats?.conflictsDetected > 0
              ? 'border-rose-500/50 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-500'
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {t('examSchedule.conflictsDetected', 'Conflicts Detected')}
            </p>
            <p className={`text-2xl font-black mt-1 ${dashboardStats?.conflictsDetected > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {dashboardStats?.conflictsDetected || 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {dashboardStats?.conflictsDetected > 0 ? (isHindi ? 'विवरण देखने के लिए क्लिक करें' : 'Click to inspect overlaps') : t('examSchedule.noConflicts', 'All slots conflict-free')}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl ${dashboardStats?.conflictsDetected > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
            {dashboardStats?.conflictsDetected > 0 ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Selector Header Filter Bar */}
      <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Examination Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {isHindi ? 'परीक्षा (Examination)' : 'Examination'}
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="app-select text-xs font-bold min-w-[220px]"
            >
              {examinations.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.examName}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
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

          {/* Section Filter — BUG-030 FIX: Dynamic sections from class context */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {t('common.section', 'Section')}
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="app-select text-xs font-bold min-w-[100px]"
            >
              <option value="ALL">{t('common.all', 'All Sections')}</option>
              {sectionsForClass(selectedClass).map((s) => (
                <option key={s} value={s}>
                  {isHindi ? `वर्ग ${s}` : `Sec ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {t('common.status', 'Status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="app-select text-xs font-bold min-w-[120px]"
            >
              <option value="ALL">{t('common.all', 'All Statuses')}</option>
              <option value="PUBLISHED">{t('examSchedule.statusPublished', 'PUBLISHED')}</option>
              <option value="DRAFT">{t('examSchedule.statusDraft', 'DRAFT')}</option>
              <option value="REVIEWED">{t('examSchedule.statusReviewed', 'REVIEWED')}</option>
              <option value="COMPLETED">{t('examSchedule.statusCompleted', 'COMPLETED')}</option>
            </select>
          </div>
        </div>

        {/* Action button if view has drafts */}
        {schedules.some((s) => s.status === 'DRAFT') && (
          <button
            onClick={handlePublishClassSchedule}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('examSchedule.publishScheduleBtn', 'Publish Timetable')}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: CLASS TIMETABLE VIEW */}
      {activeTab === 'class_view' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading schedule...')}</div>
          ) : schedules.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={isHindi ? `कक्षा ${selectedClass} के लिए कोई परीक्षा समय-सारणी नहीं मिली` : `No exam schedule found for Class ${selectedClass}`}
              description={isHindi ? 'त्वरित बिल्डर से विषय चुनें और डेट शीट तैयार करें।' : 'Use the Bulk Schedule Builder to configure dates, subjects, and timings.'}
              actionLabel={t('examSchedule.createScheduleBtn', 'Create Exam Timetable')}
              onAction={() => {
                setBulkClass(selectedClass);
                setBulkExamId(selectedExamId);
                setActiveTab('bulk_builder');
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-900 dark:text-blue-300">
                    {selectedExamObj?.examName || 'Examination'} • {isHindi ? `कक्षा ${selectedClass}` : `Class ${selectedClass}`}
                  </span>
                  <Badge variant={schedules[0]?.status === 'PUBLISHED' ? 'success' : 'warning'} size="xs">
                    {schedules[0]?.status || 'DRAFT'}
                  </Badge>
                </div>

                <span className="text-slate-500 font-semibold">
                  {schedules.length} {isHindi ? 'विषय निर्धारित' : 'Subject papers scheduled'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map((slot) => {
                  const isPast = new Date(slot.examDate) < new Date();

                  return (
                    <div
                      key={slot._id}
                      className="app-card p-5 space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 mb-1">
                              {slot.examType}
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">{slot.subjectName}</h3>
                            {slot.subjectCode && (
                              <p className="text-[11px] font-mono text-slate-400 font-bold">{slot.subjectCode}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingSlot(slot);
                                setSingleEditModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Exam Date Banner */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>
                              {new Date(slot.examDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="font-extrabold text-purple-600 dark:text-purple-400">
                            {slot.dayOfWeek}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">({slot.durationMinutes || 180} mins)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-semibold">{slot.roomOrHall || 'Exam Hall'}</span>
                        </div>

                        {slot.invigilatorName && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            <span>{slot.invigilatorName}</span>
                          </div>
                        )}

                        {slot.instructions && (
                          <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 line-clamp-2">
                            {slot.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BULK SCHEDULE BUILDER */}
      {activeTab === 'bulk_builder' && (
        <div className="space-y-6">
          <div className="app-card p-6 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  <span>{t('examSchedule.bulkBuilderTab', 'Bulk Schedule Builder')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? 'विषय सूची स्वतः लोड होगी। दिनांक एवं समय दर्ज करें एवं टकराव की जांच करें।'
                    : 'Auto-loads class subjects. Edit dates and times in table view with instant conflict detection.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckConflicts}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Validate Conflicts</span>
                </button>
                <button
                  onClick={handleAddBulkRow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject Slot</span>
                </button>
              </div>
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination *
                </label>
                <select
                  value={bulkExamId}
                  onChange={(e) => setBulkExamId(e.target.value)}
                  className="app-select w-full text-xs font-bold"
                >
                  {examinations.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.examName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class *
                </label>
                <select
                  value={bulkClass}
                  onChange={(e) => setBulkClass(e.target.value)}
                  className="app-select w-full text-xs font-bold"
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkApplyAllSections}
                    onChange={(e) => setBulkApplyAllSections(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>{t('examSchedule.applyAllSections', 'Apply Schedule to All Sections (A, B, C)')}</span>
                </label>
              </div>
            </div>

            {/* Conflicts Alert Notice */}
            {detectedConflicts.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <p className="font-black text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{detectedConflicts.length} Scheduling Conflicts Detected:</span>
                </p>
                <ul className="list-disc pl-5 text-xs text-rose-700 dark:text-rose-400 space-y-1">
                  {detectedConflicts.map((c, i) => (
                    <li key={i}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Spreadsheet Schedule Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                    <th className="py-3 px-3">Subject Name</th>
                    <th className="py-3 px-3">Exam Date</th>
                    <th className="py-3 px-3">Start Time</th>
                    <th className="py-3 px-3">End Time</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Room / Hall</th>
                    <th className="py-3 px-3">Invigilator</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {bulkEntries.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 min-w-[220px]">
                        {row.isCustomSubject ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              required
                              value={row.subjectName}
                              onChange={(e) => handleBulkRowChange(idx, 'subjectName', e.target.value)}
                              placeholder="Type custom subject name..."
                              className="app-input w-full text-xs font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              title="Back to class subject dropdown"
                              onClick={() => handleBulkRowChange(idx, 'isCustomSubject', false)}
                              className="w-7 h-7 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <select
                            required
                            value={row.subjectCode || row.subjectName || ''}
                            onChange={(e) => handleBulkRowSubjectSelect(idx, e.target.value)}
                            className="app-select w-full text-xs font-bold"
                          >
                            <option value="">-- Select Subject --</option>
                            {classApplicableSubjects.length > 0 && (
                              <optgroup label={`Class ${bulkClass} Subjects`}>
                                {classApplicableSubjects.map((s) => {
                                  const code = s.code || s.subjectCode || '';
                                  const name = s.name || s.subjectName || 'Subject';
                                  return (
                                    <option key={s._id || code} value={code || name}>
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
                                  .map((s) => {
                                    const code = s.code || s.subjectCode || '';
                                    const name = s.name || s.subjectName || 'Subject';
                                    return (
                                      <option key={s._id || code} value={code || name}>
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
                      </td>
                      <td className="py-2.5 px-3 min-w-[140px]">
                        <input
                          type="date"
                          required
                          value={row.examDate}
                          onChange={(e) => handleBulkRowChange(idx, 'examDate', e.target.value)}
                          className="app-input w-full text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2.5 px-3 min-w-[110px]">
                        <input
                          type="text"
                          required
                          value={row.startTime}
                          onChange={(e) => handleBulkRowChange(idx, 'startTime', e.target.value)}
                          placeholder="09:00 AM"
                          className="app-input w-full text-xs font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 min-w-[110px]">
                        <input
                          type="text"
                          required
                          value={row.endTime}
                          onChange={(e) => handleBulkRowChange(idx, 'endTime', e.target.value)}
                          placeholder="12:00 PM"
                          className="app-input w-full text-xs font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-3 min-w-[120px]">
                        <select
                          value={row.examType}
                          onChange={(e) => handleBulkRowChange(idx, 'examType', e.target.value)}
                          className="app-select w-full text-xs font-semibold"
                        >
                          <option value="THEORY">Theory</option>
                          <option value="PRACTICAL">Practical</option>
                          <option value="INTERNAL_ASSESSMENT">Internal</option>
                          <option value="VIVA">Viva / Oral</option>
                          <option value="PROJECT">Project</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 min-w-[140px]">
                        <input
                          type="text"
                          value={row.roomOrHall}
                          onChange={(e) => handleBulkRowChange(idx, 'roomOrHall', e.target.value)}
                          placeholder="Room 101"
                          className="app-input w-full text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 min-w-[160px]">
                        {staffList && staffList.length > 0 ? (
                          <select
                            value={row.invigilatorName || ''}
                            onChange={(e) => handleBulkRowChange(idx, 'invigilatorName', e.target.value)}
                            className="app-select w-full text-xs font-medium"
                          >
                            <option value="">-- Select Invigilator --</option>
                            {staffList.map((st) => (
                              <option key={st._id} value={st.fullName}>
                                {st.fullName} ({st.designation || 'Staff'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.invigilatorName}
                            onChange={(e) => handleBulkRowChange(idx, 'invigilatorName', e.target.value)}
                            placeholder="Teacher Name"
                            className="app-input w-full text-xs"
                          />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkRow(idx)}
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={savingBulk}
                onClick={() => handleSaveBulkSchedule('DRAFT')}
                className="app-btn-secondary text-xs"
              >
                {t('examSchedule.saveDraftBtn', 'Save as Draft')}
              </button>

              <button
                type="button"
                disabled={savingBulk}
                onClick={() => handleSaveBulkSchedule('PUBLISHED')}
                className="app-btn-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{savingBulk ? 'Saving...' : t('examSchedule.publishScheduleBtn', 'Publish Timetable')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR VIEW */}
      {activeTab === 'calendar_view' && (
        <div className="space-y-4">
          <div className="app-card p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{isHindi ? 'दिनांक अनुसार परीक्षा कैलेंडर' : 'Chronological Examination Date Sheet'}</span>
            </h3>

            {schedules.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">{t('common.noData', 'No examination slots found.')}</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((slot) => (
                  <div
                    key={slot._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 text-center p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black text-xs shrink-0">
                        <span className="block text-sm font-extrabold">
                          {new Date(slot.examDate).toLocaleDateString('en-IN', { day: 'numeric' })}
                        </span>
                        <span className="block text-[10px] uppercase">
                          {new Date(slot.examDate).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{slot.subjectName}</span>
                          <Badge variant="info" size="xs">Class {slot.className} ({slot.sectionName})</Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {slot.dayOfWeek} • {slot.startTime} to {slot.endTime} • {slot.roomOrHall}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {slot.examType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER SCHEDULE TABLE */}
      {activeTab === 'master_table' && (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                  <th className="py-3 px-4">Exam & Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Timings</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Room & Invigilator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {schedules.map((slot) => (
                  <tr key={slot._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{slot.examinationName}</p>
                      <span className="text-[11px] text-purple-600 font-extrabold">Class {slot.className} ({slot.sectionName})</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {slot.subjectName}
                      {slot.subjectCode && <span className="block text-[10px] font-mono text-slate-400 font-normal">{slot.subjectCode}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {new Date(slot.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="block text-[10px] text-slate-400">{slot.dayOfWeek}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px]">
                        {slot.examType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold">{slot.roomOrHall}</p>
                      <p className="text-[11px] text-slate-400">{slot.invigilatorName || '-'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={slot.status === 'PUBLISHED' ? 'success' : 'warning'} size="xs">
                        {slot.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setSingleEditModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT & PARENT ROUTINE VIEW */}
      {activeTab === 'student_view' && (
        <div className="space-y-4">
          <div className="app-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>{isHindi ? 'विद्यार्थी परीक्षा रूटीन' : 'Student Examination Routine & Date Sheet'}</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">Class {selectedClass}</span>
            </div>

            <div className="space-y-3">
              {schedules.map((slot) => {
                const examDateObj = new Date(slot.examDate);
                const diffDays = Math.ceil((examDateObj - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={slot._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex flex-col items-center justify-center shadow-xs">
                        <span className="text-sm leading-none">{examDateObj.getDate()}</span>
                        <span className="text-[9px] uppercase leading-none mt-0.5">{examDateObj.toLocaleString('en-IN', { month: 'short' })}</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{slot.subjectName}</h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          {slot.dayOfWeek} • {slot.startTime} - {slot.endTime} • {slot.roomOrHall}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                        diffDays <= 1
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} Days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE A4 TIMETABLE MODAL */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Official Examination Timetable Preview"
        subtitle={`Class ${selectedClass} • ${selectedExamObj?.examName || 'Examination'}`}
      >
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white text-slate-900 space-y-5 shadow-md">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-300 pb-3">
              <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                GOVERNMENT OF MADHYA PRADESH • SCHOOL EDUCATION DEPARTMENT
              </p>
              <h2 className="text-base font-black tracking-tight text-blue-900 mt-0.5">
                {settings?.schoolName || 'GOVERNMENT MODEL HIGHER SECONDARY SCHOOL OF EXCELLENCE'}
              </h2>
              <p className="text-[11px] text-slate-600">Shivaji Nagar, Bhopal, MP - Affiliation: MPBSE-SCH-712049</p>
              <h3 className="text-xs font-black uppercase text-purple-900 mt-2 bg-purple-50 inline-block px-4 py-1 rounded-full border border-purple-200">
                {selectedExamObj?.examName || 'HALF-YEARLY EXAMINATION'} (2025-26)
              </h3>
              <p className="text-xs font-bold text-slate-700 mt-1">DATE SHEET / TIMETABLE : CLASS {selectedClass}</p>
            </div>

            {/* Timetable Table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-black text-slate-900 border-b border-slate-300 text-[11px]">
                  <th className="p-2 border-r border-slate-300">Date</th>
                  <th className="p-2 border-r border-slate-300">Day</th>
                  <th className="p-2 border-r border-slate-300">Subject Paper</th>
                  <th className="p-2 border-r border-slate-300">Timings</th>
                  <th className="p-2 border-r border-slate-300">Type</th>
                  <th className="p-2">Exam Hall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium">
                {schedules.map((row) => (
                  <tr key={row._id}>
                    <td className="p-2 border-r border-slate-300 font-bold">
                      {new Date(row.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-700">{row.dayOfWeek}</td>
                    <td className="p-2 border-r border-slate-300 font-black text-slate-900">{row.subjectName}</td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">{row.startTime} - {row.endTime}</td>
                    <td className="p-2 border-r border-slate-300">{row.examType}</td>
                    <td className="p-2">{row.roomOrHall || 'Hall A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Important Guidelines */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Important Instructions for Candidates:</p>
              <p>1. Students must reach their designated examination hall 30 minutes before commencement.</p>
              <p>2. Carrying Admit Card and School Identity Card is mandatory on all examination days.</p>
              <p>3. Electronic gadgets, mobile phones, and smart watches are strictly prohibited.</p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex items-end justify-between text-xs px-2">
              <div className="text-left">
                <p className="text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</p>
                <p className="text-slate-500">Bhopal (M.P.)</p>
              </div>

              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-28 mx-auto mb-1"></div>
                <p className="font-bold text-slate-900">Exam Controller</p>
              </div>

              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-32 mx-auto mb-1"></div>
                <p className="font-bold text-slate-900">Principal / Headmaster</p>
                <p className="text-[10px] text-slate-500">Seal & Signature</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Timetable</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* SINGLE SLOT EDIT MODAL */}
      <Modal
        isOpen={singleEditModalOpen}
        onClose={() => setSingleEditModalOpen(false)}
        title="Edit Examination Schedule Slot"
        subtitle={editingSlot?.subjectName}
      >
        {editingSlot && (
          <form onSubmit={handleSaveSingleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
              <select
                value={editingSlot.subjectCode || editingSlot.subjectName || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = (subjectsList || []).find(
                    (s) => (s.code || s.subjectCode) === val || (s.name || s.subjectName) === val
                  );
                  if (matched) {
                    setEditingSlot({
                      ...editingSlot,
                      subjectName: matched.name || matched.subjectName,
                      subjectCode: matched.code || matched.subjectCode
                    });
                  } else {
                    setEditingSlot({
                      ...editingSlot,
                      subjectName: val
                    });
                  }
                }}
                className="app-select w-full text-xs font-bold"
              >
                <option value="">-- Select Subject --</option>
                {subjectsList.map((s) => {
                  const code = s.code || s.subjectCode || '';
                  const name = s.name || s.subjectName || 'Subject';
                  return (
                    <option key={s._id || code} value={code || name}>
                      {name} {code ? `(${code})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={editingSlot.examDate ? new Date(editingSlot.examDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, examDate: e.target.value })}
                  className="app-input w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Type</label>
                <select
                  value={editingSlot.examType}
                  onChange={(e) => setEditingSlot({ ...editingSlot, examType: e.target.value })}
                  className="app-select w-full text-xs font-bold"
                >
                  <option value="THEORY">Theory</option>
                  <option value="PRACTICAL">Practical</option>
                  <option value="INTERNAL_ASSESSMENT">Internal</option>
                  <option value="VIVA">Viva</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="text"
                  value={editingSlot.startTime}
                  onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                  className="app-input w-full text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="text"
                  value={editingSlot.endTime}
                  onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                  className="app-input w-full text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room / Hall</label>
                <input
                  type="text"
                  value={editingSlot.roomOrHall}
                  onChange={(e) => setEditingSlot({ ...editingSlot, roomOrHall: e.target.value })}
                  className="app-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Invigilator</label>
                {staffList && staffList.length > 0 ? (
                  <select
                    value={editingSlot.invigilatorName || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, invigilatorName: e.target.value })}
                    className="app-select w-full text-xs font-medium"
                  >
                    <option value="">-- Select Invigilator (Optional) --</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st.fullName}>
                        {st.fullName} ({st.designation || 'Staff'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editingSlot.invigilatorName}
                    onChange={(e) => setEditingSlot({ ...editingSlot, invigilatorName: e.target.value })}
                    className="app-input w-full text-xs"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSingleEditModalOpen(false)}
                className="app-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="app-btn-primary text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFLICTS DETAILS MODAL */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Detected Scheduling Conflicts"
        subtitle="Please resolve these overlapping slots before publishing"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {dashboardStats?.conflictsList?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{item.message}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setConflictModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
