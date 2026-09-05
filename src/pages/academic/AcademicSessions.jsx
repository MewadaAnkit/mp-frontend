import React, { useState, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar, Plus, CheckCircle2, Lock, Sparkles, X, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcademicSessions() {
  const { sessions, reloadMetadata } = useAcademic();
  const { t, isHindi } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) return sessions || [];
    const term = searchTerm.toLowerCase();
    return (sessions || []).filter(s => 
      s.sessionName?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  }, [sessions, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (id, sessionName) => {
    setActionLoadingId(id);
    try {
      const res = await api.put(`/academic/sessions/${id}/set-current`);
      if (res.data.success) {
        toast.success(`Session ${sessionName} is now active!`);
        reloadMetadata();
      }
    } catch (err) {
      toast.error('Failed to update active session');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('sessions.title', 'Academic Sessions Management')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('sessions.subtitle', 'Configure academic years and manage historical records')}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>{t('sessions.newSessionBtn', 'New Academic Session')}</span>
        </button>
      </div>

      {/* Sessions Table Card */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('sessions.searchPlaceholder', 'Search sessions...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-slate-400">
            <span>{t('sessions.total', 'Total')}: <strong className="text-slate-900 dark:text-white font-bold">{sessions.length}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {t('sessions.activeSession', 'Active')}: 
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {sessions.find(s => s.isCurrent)?.sessionName || 'None'}
              </strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">{t('sessions.colIndex', '#')}</th>
                <th className="py-3.5 px-4 min-w-[160px]">{t('sessions.colSessionName', 'Session Name')}</th>
                <th className="py-3.5 px-4 min-w-[200px]">{t('sessions.colDescription', 'Description')}</th>
                <th className="py-3.5 px-4 min-w-[140px]">{t('sessions.colStartDate', 'Start Date')}</th>
                <th className="py-3.5 px-4 min-w-[140px]">{t('sessions.colEndDate', 'End Date')}</th>
                <th className="py-3.5 px-4 w-28 text-center">{t('sessions.colStatus', 'Status')}</th>
                <th className="py-3.5 px-4 w-44 text-right">{t('sessions.colAction', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                      {t('sessions.noSessionsFound', 'No academic sessions found')}
                    </p>
                    {searchTerm && (
                      <p className="text-[11px] mt-1">
                        {t('sessions.clearSearchTip', 'Try clearing your search query')}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess, idx) => (
                  <tr
                    key={sess._id}
                    className={`transition-colors duration-150 ${
                      sess.isCurrent
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Session Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          sess.isCurrent
                            ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono text-[13px] font-bold text-slate-900 dark:text-white block">
                            {sess.sessionName}
                          </span>
                          {sess.isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {t('sessions.currentSystemActive', 'Current System Active')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {sess.description || (isHindi ? 'शैक्षणिक वर्ष' : 'Academic Year')}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {sess.startDate ? new Date(sess.startDate).toLocaleDateString('en-GB') : '-'}
                        </span>
                      </div>
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {sess.endDate ? new Date(sess.endDate).toLocaleDateString('en-GB') : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {sess.isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <Sparkles className="w-3 h-3" />
                          {t('sessions.statusActive', 'ACTIVE')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60">
                          {t('sessions.statusArchived', 'ARCHIVED')}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {sess.isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('sessions.currentActive', 'Active Session')}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCurrent(sess._id, sess.sessionName)}
                          disabled={actionLoadingId === sess._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 border border-emerald-200 dark:border-emerald-500/30 hover:border-transparent transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {actionLoadingId === sess._id 
                              ? t('sessions.activating', 'Activating...') 
                              : t('sessions.setAsActive', 'Set as Active')}
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('sessions.createTitle', 'Create Academic Session')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {t('sessions.sessionNameLabel', 'Session Name *')}
                </label>
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
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    {t('sessions.startDateLabel', 'Start Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full app-input font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    {t('sessions.endDateLabel', 'End Date *')}
                  </label>
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
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  {t('sessions.descriptionLabel', 'Description')}
                </label>
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
                  {t('sessions.setDefaultActive', 'Set as default active session')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="app-btn-secondary"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {submitting 
                    ? t('sessions.creatingBtn', 'Creating...') 
                    : t('sessions.createBtn', 'Create Session')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
