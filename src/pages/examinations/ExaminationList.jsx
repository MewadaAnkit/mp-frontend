import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { 
  Award, Plus, Lock, Unlock, Calendar, CheckCircle2, 
  Search, Trash2, Edit, Table, LayoutGrid, X 
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  examName: '',
  examCode: '',
  schemeId: '',
  applicableClasses: ['9'],
  startDate: '',
  endDate: '',
  marksSubmissionDeadline: '',
  description: ''
};

export default function ExaminationList() {
  const { currentSession, classes } = useAcademic();
  const [exams, setExams] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'table' (default) or 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exRes, schRes] = await Promise.all([
        api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`),
        api.get('/schemes')
      ]);
      if (exRes.data.success) setExams(exRes.data.data);
      if (schRes.data.success) {
        setSchemes(schRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load examination events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSession]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      // Class filter
      if (selectedClass !== 'ALL') {
        if (!ex.applicableClasses || !ex.applicableClasses.includes(selectedClass)) {
          return false;
        }
      }
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = ex.examName && ex.examName.toLowerCase().includes(term);
        const matchesCode = ex.examCode && ex.examCode.toLowerCase().includes(term);
        const matchesScheme = ex.schemeId?.schemeName && ex.schemeId.schemeName.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesScheme) return false;
      }
      return true;
    });
  }, [exams, selectedClass, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingExam(null);
    setFormData({
      ...DEFAULT_FORM,
      schemeId: schemes.length > 0 ? schemes[0]._id : '',
      applicableClasses: selectedClass !== 'ALL' ? [selectedClass] : ['9']
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ex) => {
    setEditingExam(ex);
    setFormData({
      examName: ex.examName || '',
      examCode: ex.examCode || '',
      schemeId: ex.schemeId?._id || ex.schemeId || (schemes.length > 0 ? schemes[0]._id : ''),
      applicableClasses: ex.applicableClasses || ['9'],
      startDate: ex.startDate ? ex.startDate.split('T')[0] : '',
      endDate: ex.endDate ? ex.endDate.split('T')[0] : '',
      marksSubmissionDeadline: ex.marksSubmissionDeadline ? ex.marksSubmissionDeadline.split('T')[0] : '',
      description: ex.description || ''
    });
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        sessionName: currentSession?.sessionName || '2025-26'
      };

      if (editingExam) {
        const res = await api.put(`/examinations/${editingExam._id}`, payload);
        if (res.data.success) {
          toast.success('Examination event updated successfully!');
          setShowModal(false);
          setEditingExam(null);
          loadData();
        }
      } else {
        const res = await api.post('/examinations', payload);
        if (res.data.success) {
          toast.success('Examination event created successfully!');
          setShowModal(false);
          loadData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save examination');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/examinations/${examToDelete._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Examination deleted successfully');
        setExamToDelete(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete examination');
    } finally {
      setDeleting(false);
    }
  };

  // Lock / Unlock toggle
  const toggleLock = async (id) => {
    try {
      const res = await api.put(`/examinations/${id}/toggle-lock`);
      if (res.data.success) {
        toast.success(res.data.message);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to toggle lock status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Examination Setup & Schedules</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Configure examination events, evaluation schemes, and marks entry submission deadlines
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
            onClick={handleOpenCreate}
            className="app-btn-primary cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Examination</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-3 sm:p-4">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search examinations by name, code, scheme..."
            className="w-full app-input !pl-10 !py-2.5 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full app-input !py-2.5 font-bold"
          >
            <option value="ALL">All Classes</option>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading examinations...</p>
        </div>
      )}

      {/* TABLE VIEW (Default) */}
      {!loading && viewMode === 'table' && filteredExams.length > 0 && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-32">Exam Code</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Examination Title</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Scheme Template</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Applicable Classes</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Deadline</th>
                  <th className="py-3.5 px-4 w-36 text-center">Marks Entry Status</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {filteredExams.map((ex) => (
                  <tr
                    key={ex._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* Exam Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-500/20">
                        {ex.examCode}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white text-[13px] block">
                        {ex.examName}
                      </span>
                      {ex.sessionName && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Session: {ex.sessionName}
                        </span>
                      )}
                    </td>

                    {/* Scheme */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                        {ex.schemeId?.schemeName || 'MP Scheme Standard'}
                      </span>
                      {ex.schemeId?.totalMaxMarks && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {ex.schemeId.totalMaxMarks} Max Marks
                        </span>
                      )}
                    </td>

                    {/* Classes */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {ex.applicableClasses?.map(c => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200/60 dark:border-slate-700/60"
                          >
                            Class {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {ex.marksSubmissionDeadline
                            ? new Date(ex.marksSubmissionDeadline).toLocaleDateString('en-GB')
                            : 'Open Deadline'}
                        </span>
                      </span>
                    </td>

                    {/* Marks Status & Toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleLock(ex._id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          ex.isMarksEntryLocked
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100'
                        }`}
                        title={ex.isMarksEntryLocked ? 'Click to Unlock Marks Entry' : 'Click to Lock Marks Entry'}
                      >
                        {ex.isMarksEntryLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{ex.isMarksEntryLocked ? 'Marks Locked' : 'Open for Marks'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ex)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                          title={`Edit ${ex.examName}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExamToDelete(ex)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title={`Delete ${ex.examName}`}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* CARDS VIEW */}
      {!loading && viewMode === 'grid' && filteredExams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((ex) => (
            <div key={ex._id} className="app-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {ex.examCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{ex.examName}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Scheme: {ex.schemeId?.schemeName || 'MP Scheme Standard'}
                    </span>
                  </div>
                  <span className={ex.isMarksEntryLocked ? 'app-badge-red' : 'app-badge-green'}>
                    {ex.isMarksEntryLocked ? 'Marks Locked' : 'Open'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 py-3 border-y border-slate-200 dark:border-slate-800 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Classes:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Class {ex.applicableClasses?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Submission Deadline:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {ex.marksSubmissionDeadline ? new Date(ex.marksSubmissionDeadline).toLocaleDateString('en-GB') : 'Open'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleLock(ex._id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                    ex.isMarksEntryLocked
                      ? 'border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                      : 'border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                  }`}
                >
                  {ex.isMarksEntryLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{ex.isMarksEntryLocked ? 'Unlock' : 'Lock'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ex)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamToDelete(ex)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExams.length === 0 && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No examinations found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm 
              ? `No examinations match "${searchTerm}". Try another search term.`
              : 'Click "+ New Examination" above to register an academic examination event.'}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingExam ? `Edit Event: ${editingExam.examName}` : 'Create Examination Event'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingExam(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Exam Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Annual Examination 2025-26"
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full app-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Exam Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ANNUAL_2026"
                    value={formData.examCode}
                    onChange={(e) => setFormData({ ...formData, examCode: e.target.value.toUpperCase() })}
                    className="w-full app-input font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Scheme Template</label>
                  <select
                    value={formData.schemeId}
                    onChange={(e) => setFormData({ ...formData, schemeId: e.target.value })}
                    className="w-full app-input font-bold"
                  >
                    {schemes.map(s => <option key={s._id} value={s._id}>{s.schemeName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Marks Submission Deadline</label>
                <input
                  type="date"
                  value={formData.marksSubmissionDeadline}
                  onChange={(e) => setFormData({ ...formData, marksSubmissionDeadline: e.target.value })}
                  className="w-full app-input font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExam(null);
                  }}
                  className="app-btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : (editingExam ? 'Update Event' : 'Create Examination')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Examination?"
        message={
          examToDelete
            ? `Are you sure you want to delete examination "${examToDelete.examName}" (${examToDelete.examCode})? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete Examination"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
