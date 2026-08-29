import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  MessageSquare,
  FileText,
  UserCheck
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

export default function AdmissionsPipeline() {
  const { currentSession, classes } = useAcademic();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'MALE',
    dob: '',
    appliedClass: '1',
    previousSchool: '',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: ''
  });

  const [noteText, setNoteText] = useState('');
  const [convertData, setConvertData] = useState({
    admissionNo: '',
    section: 'A',
    rollNo: '1',
    samagraId: '',
    mpBseRollNo: '',
    stream: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, [currentSession, statusFilter, classFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      let url = `/admissions/inquiries?session=${currentSession?.sessionName || '2025-26'}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (classFilter) url += `&className=${classFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load admission inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admissions/inquiries', {
        ...formData,
        academicSession: currentSession?.sessionName || '2025-26'
      });
      if (res.data.success) {
        toast.success('Admission inquiry created successfully!');
        setNewModalOpen(false);
        setFormData({
          studentName: '',
          gender: 'MALE',
          dob: '',
          appliedClass: '1',
          previousSchool: '',
          fatherName: '',
          motherName: '',
          guardianPhone: '',
          guardianEmail: '',
          address: ''
        });
        fetchInquiries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating inquiry');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/admissions/inquiries/${id}`, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        fetchInquiries();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await api.post(`/admissions/inquiries/${selectedInquiry._id}/notes`, { text: noteText });
      if (res.data.success) {
        toast.success('Follow-up note logged');
        setNoteText('');
        setNotesModalOpen(false);
        fetchInquiries();
      }
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleConvertStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/admissions/inquiries/${selectedInquiry._id}/convert`, convertData);
      if (res.data.success) {
        toast.success(res.data.message);
        setConvertModalOpen(false);
        fetchInquiries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert student');
    }
  };

  const openConvertModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    const sessionYear = (currentSession?.sessionName || '2025-26').split('-')[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setConvertData({
      admissionNo: `SCH-${sessionYear}-${randomSuffix}`,
      section: 'A',
      rollNo: '1',
      samagraId: '',
      mpBseRollNo: '',
      stream: ''
    });
    setConvertModalOpen(true);
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'NEW':
        return 'info';
      case 'CONTACTED':
      case 'APPLICATION_STARTED':
      case 'UNDER_REVIEW':
        return 'warning';
      case 'APPROVED':
      case 'ADMITTED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const totalInquiries = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const underReviewCount = inquiries.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'APPLICATION_STARTED').length;
  const admittedCount = inquiries.filter((i) => i.status === 'ADMITTED' || i.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Admissions Pipeline
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Track inquiries, document reviews, approvals, and 1-click student enrollments
          </p>
        </div>
        <button
          onClick={() => setNewModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission Inquiry</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget title="Total Inquiries" value={totalInquiries} subtitle="Active academic session" icon={UserPlus} color="blue" />
        <StatWidget title="New Leads" value={newCount} subtitle="Needs immediate contact" icon={Clock} color="amber" />
        <StatWidget title="In Review" value={underReviewCount} subtitle="Entrance/Doc verification" icon={FileText} color="purple" />
        <StatWidget title="Approved / Admitted" value={admittedCount} subtitle="Successfully converted" icon={CheckCircle2} color="emerald" />
      </div>

      {/* Filters & Search */}
      <div className="app-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInquiries()}
            placeholder="Search by student name, inquiry no, phone, father name..."
            className="app-input pl-10 w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="app-select text-xs min-w-[130px]"
          >
            <option value="">All Classes</option>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="app-select text-xs min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ADMITTED">ADMITTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <button
            onClick={fetchInquiries}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="app-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No admission inquiries found"
            description="Create your first inquiry lead to start tracking potential student admissions."
            actionLabel="Add New Inquiry"
            onAction={() => setNewModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-[#131b2e]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Inquiry No / Date</th>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Class Applied</th>
                  <th className="py-3 px-4">Parent / Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-semibold">
                      <p className="font-bold text-slate-900 dark:text-white">{inq.inquiryNo}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{inq.studentName}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{inq.gender?.toLowerCase()}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        Class {inq.appliedClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{inq.fatherName || 'Guardian'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{inq.guardianPhone}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariant(inq.status)} size="sm">
                        {inq.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Follow-up notes */}
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setNotesModalOpen(true);
                          }}
                          title="View Follow-up Notes"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Status Quick Dropdown */}
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq._id, e.target.value)}
                          disabled={inq.status === 'ADMITTED'}
                          className="app-select text-[11px] py-1 px-2 font-bold cursor-pointer"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="ADMITTED" disabled>
                            ADMITTED
                          </option>
                        </select>

                        {/* Convert to Student Button */}
                        {inq.status !== 'ADMITTED' && inq.status !== 'REJECTED' && (
                          <button
                            onClick={() => openConvertModal(inq)}
                            title="Enroll & Convert to Student"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Enroll</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: New Admission Inquiry */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="New Admission Inquiry Lead"
        subtitle={`Academic Session: ${currentSession?.sessionName || '2025-26'}`}
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="app-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class Applying For *
              </label>
              <select
                value={formData.appliedClass}
                onChange={(e) => setFormData({ ...formData, appliedClass: e.target.value })}
                className="app-select w-full text-xs"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="app-select w-full text-xs"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="app-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father / Guardian Name"
                className="app-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Guardian Phone (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="10-digit mobile number"
                className="app-input w-full text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Previous School Attended
              </label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                placeholder="School name & city"
                className="app-input w-full text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full street address in MP"
                className="app-input w-full text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setNewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              Submit Inquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Convert Inquiry to Enrolled Student */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`Enroll Student: ${selectedInquiry?.studentName}`}
        subtitle={`Converting Inquiry ${selectedInquiry?.inquiryNo} to Registered Student Profile`}
      >
        <form onSubmit={handleConvertStudent} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300">
            Enrolling will generate official Student records, Academic Enrollment history, and open Fee Ledgers for Class {selectedInquiry?.appliedClass}.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admission Number *
              </label>
              <input
                type="text"
                required
                value={convertData.admissionNo}
                onChange={(e) => setConvertData({ ...convertData, admissionNo: e.target.value })}
                className="app-input w-full text-xs uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
              <select
                value={convertData.section}
                onChange={(e) => setConvertData({ ...convertData, section: e.target.value })}
                className="app-select w-full text-xs uppercase"
              >
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Roll No</label>
              <input
                type="text"
                required
                value={convertData.rollNo}
                onChange={(e) => setConvertData({ ...convertData, rollNo: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                MP Samagra ID (9-Digit)
              </label>
              <input
                type="text"
                value={convertData.samagraId}
                onChange={(e) => setConvertData({ ...convertData, samagraId: e.target.value })}
                placeholder="e.g. 192837465"
                className="app-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                MPBSE Board Roll / Candidate ID
              </label>
              <input
                type="text"
                value={convertData.mpBseRollNo}
                onChange={(e) => setConvertData({ ...convertData, mpBseRollNo: e.target.value })}
                placeholder="State identifier (Optional for Cls 5, 8, 10)"
                className="app-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stream (Class 11/12)</label>
              <select
                value={convertData.stream}
                onChange={(e) => setConvertData({ ...convertData, stream: e.target.value })}
                className="app-select w-full text-xs"
              >
                <option value="">None / General</option>
                <option value="Science">Science (PCM/PCB)</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Humanities / Arts</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
            >
              Confirm & Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Follow-up Notes History */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title={`Follow-up Notes: ${selectedInquiry?.studentName}`}
        subtitle={`Inquiry No: ${selectedInquiry?.inquiryNo} • Phone: ${selectedInquiry?.guardianPhone}`}
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {selectedInquiry?.notes && selectedInquiry.notes.length > 0 ? (
              selectedInquiry.notes.map((n, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <p className="text-slate-900 dark:text-white font-medium">{n.text}</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Logged by: {n.addedBy}</span>
                    <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No notes logged yet.</p>
            )}
          </div>

          <form onSubmit={handleAddNote} className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <textarea
              rows={2}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add conversation notes, call summary, entrance test marks..."
              className="app-input w-full text-xs"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                Log Note
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
