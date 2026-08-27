import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { Award, Plus, Lock, Unlock, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExaminationList() {
  const { currentSession, classes } = useAcademic();
  const [exams, setExams] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    examName: '',
    examCode: '',
    schemeId: '',
    applicableClasses: ['9'],
    startDate: '',
    endDate: '',
    marksSubmissionDeadline: '',
    description: ''
  });

  const loadData = async () => {
    try {
      const [exRes, schRes] = await Promise.all([
        api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`),
        api.get('/schemes')
      ]);
      if (exRes.data.success) setExams(exRes.data.data);
      if (schRes.data.success) {
        setSchemes(schRes.data.data);
        if (schRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, schemeId: schRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSession]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sessionName: currentSession?.sessionName || '2025-26'
      };
      const res = await api.post('/examinations', payload);
      if (res.data.success) {
        toast.success('Examination created successfully!');
        setShowModal(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Examination Schedules</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage academic examination events and marks locking deadlines</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map(ex => (
          <div key={ex._id} className="app-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{ex.examCode}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{ex.examName}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scheme: {ex.schemeId?.schemeName || 'MP Scheme'}</span>
              </div>
              <span className={ex.isMarksEntryLocked ? 'app-badge-red' : 'app-badge-green'}>
                {ex.isMarksEntryLocked ? 'Marks Locked' : 'Open for Marks'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 py-3 border-y border-slate-200 dark:border-slate-800 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Applicable Classes:</span>
                <span className="font-bold text-slate-900 dark:text-white">Class {ex.applicableClasses?.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Submission Deadline:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {ex.marksSubmissionDeadline ? new Date(ex.marksSubmissionDeadline).toLocaleDateString('en-GB') : 'Open'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toggleLock(ex._id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                  ex.isMarksEntryLocked
                    ? 'border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                    : 'border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                }`}
              >
                {ex.isMarksEntryLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{ex.isMarksEntryLocked ? 'Unlock Marks Entry' : 'Lock Marks Entry'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Examination Event</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Exam Name (e.g. Annual Exam 2025-26)</label>
                <input
                  type="text"
                  required
                  placeholder="Annual Examination 2025-26"
                  value={formData.examName}
                  onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Exam Code</label>
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
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Scheme Template</label>
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
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Marks Submission Deadline</label>
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
                  onClick={() => setShowModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary"
                >
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
