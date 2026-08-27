import React, { useState } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { Calendar, Plus, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcademicSessions() {
  const { sessions, reloadMetadata } = useAcademic();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/sessions', formData);
      if (res.data.success) {
        toast.success(`Academic Session ${formData.sessionName} created!`);
        setShowModal(false);
        setFormData({ sessionName: '', startDate: '', endDate: '', isCurrent: false, description: '' });
        reloadMetadata();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    }
  };

  const handleSetCurrent = async (id, sessionName) => {
    try {
      const res = await api.put(`/academic/sessions/${id}/set-current`);
      if (res.data.success) {
        toast.success(`Session ${sessionName} is now active!`);
        reloadMetadata();
      }
    } catch (err) {
      toast.error('Failed to update active session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Academic Sessions Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure academic years and manage historical records</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Academic Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.map((sess) => (
          <div
            key={sess._id}
            className={`app-card p-5 space-y-4 relative overflow-hidden ${
              sess.isCurrent ? 'border-2 border-blue-500 shadow-md' : ''
            }`}
          >
            {sess.isCurrent && (
              <span className="absolute top-4 right-4 app-badge-blue">
                <Sparkles className="w-3 h-3" />
                ACTIVE SESSION
              </span>
            )}

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{sess.sessionName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sess.description || 'Academic Year'}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 py-3 border-y border-slate-200 dark:border-slate-800 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Start Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date(sess.startDate).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">End Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date(sess.endDate).toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              {!sess.isCurrent ? (
                <button
                  onClick={() => handleSetCurrent(sess._id, sess.sessionName)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Set as Active Session</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Currently Active</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Academic Session</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Session Name (e.g. 2026-27)</label>
                <input
                  type="text"
                  required
                  placeholder="2026-27"
                  value={formData.sessionName}
                  onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                  className="w-full app-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full app-input font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full app-input font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="Academic Year 2026-27"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full app-input"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCur"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="rounded app-input cursor-pointer"
                />
                <label htmlFor="isCur" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Set as default active session
                </label>
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
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
