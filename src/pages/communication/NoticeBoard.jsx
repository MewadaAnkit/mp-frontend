import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Sparkles,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function NoticeBoard() {
  const { currentSession, classes } = useAcademic();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState('ALL');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'ALL',
    targetClasses: [],
    priority: 'NORMAL'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [currentSession, audienceFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let url = `/communication/announcements?session=${currentSession?.sessionName || '2025-26'}`;
      if (audienceFilter && audienceFilter !== 'ALL') url += `&audience=${audienceFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/communication/announcements', {
        ...formData,
        academicSession: currentSession?.sessionName || '2025-26'
      });
      if (res.data.success) {
        toast.success('Announcement published');
        setModalOpen(false);
        setFormData({
          title: '',
          content: '',
          audience: 'ALL',
          targetClasses: [],
          priority: 'NORMAL'
        });
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error publishing notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this circular announcement?')) return;
    try {
      await api.delete(`/communication/announcements/${id}`);
      toast.success('Announcement removed');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const priorityVariant = (p) => {
    switch (p) {
      case 'URGENT':
        return 'danger';
      case 'HIGH':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            School Notice Board & Circulars
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Broadcast targeted announcements to staff, teachers, parents, and specific student classes
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice / Circular</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS', 'CLASS_SPECIFIC'].map((aud) => (
          <button
            key={aud}
            onClick={() => setAudienceFilter(aud)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              audienceFilter === aud
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {aud.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notices Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading school notices...</div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements published"
            description="Broadcast important circulars, event schedules, or examination alerts."
            actionLabel="Publish First Notice"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="app-card p-6 space-y-3 hover:border-blue-500/40 transition relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityVariant(item.priority)} size="sm">
                      {item.priority} PRIORITY
                    </Badge>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
                      Audience: {item.audience}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {item.content}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>Issued By: <strong className="text-slate-700 dark:text-slate-300">{item.authorName || 'Principal Office'}</strong></span>
                  <span>Session: {item.academicSession}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Publish Announcement */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish School Notice / Circular">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Half-Yearly Examination Timetable & Admit Card Notice"
              className="app-input w-full text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience *</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="app-select w-full text-xs font-bold"
              >
                <option value="ALL">Entire School (All)</option>
                <option value="TEACHERS">Faculty & Staff</option>
                <option value="PARENTS">Parents Only</option>
                <option value="STUDENTS">Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="app-select w-full text-xs font-bold"
              >
                <option value="NORMAL">Normal Notice</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content *</label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full circular notice message..."
              className="app-input w-full text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md"
            >
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
