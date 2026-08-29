import React, { useState } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { Calendar, Plus, CheckCircle2, Lock, Sparkles, X, Clock } from 'lucide-react';
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
      {/* Header */}
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

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.map((sess) => (
          <div
            key={sess._id}
            className={`app-card p-5 space-y-4 relative flex flex-col justify-between hover:shadow-md transition-shadow ${
              sess.isCurrent ? 'border-blue-500/50 dark:border-blue-500/40 ring-1 ring-blue-500/20' : ''
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    sess.isCurrent
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{sess.sessionName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sess.description || 'Academic Year'}</p>
                  </div>
                </div>

                {sess.isCurrent && (
                  <span className="app-badge-blue font-bold">
                    <Sparkles className="w-3 h-3" />
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Date Details */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration:</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {new Date(sess.startDate).toLocaleDateString('en-GB')} – {new Date(sess.endDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {!sess.isCurrent ? (
                <button
                  onClick={() => handleSetCurrent(sess._id, sess.sessionName)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Set as Active Session</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Currently Active Session</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Academic Session</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Session Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-27"
                  value={formData.sessionName}
                  onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                  className="w-full app-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full app-input font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">End Date *</label>
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
                  placeholder="e.g. Academic Year 2026-2027"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
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
