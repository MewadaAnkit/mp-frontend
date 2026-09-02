import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Award,
  Calendar,
  User,
  Sparkles,
  Download
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

export default function CertificateStudio() {
  const { currentSession } = useAcademic();
  const [searchParams] = useSearchParams();
  const prefillStudentId = searchParams.get('studentId') || '';

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Issue Form state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    certificateType: 'BONAFIDE',
    reasonForLeaving: '',
    conduct: 'Exemplary',
    feeClearedTill: 'March 2026'
  });

  useEffect(() => {
    fetchCertificates();
    if (prefillStudentId) {
      loadPrefillStudent(prefillStudentId);
    }
  }, [currentSession]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates?session=${currentSession?.sessionName || '2025-26'}`);
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadPrefillStudent = async (stId) => {
    try {
      const res = await api.get(`/students/${stId}`);
      if (res.data.success) {
        setSelectedStudent(res.data.data.student);
        setIssueModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const searchStudents = async (query) => {
    setStudentSearch(query);
    if (!query || query.length < 2) {
      setStudentResults([]);
      return;
    }
    try {
      const res = await api.get(`/students?search=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setStudentResults(res.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent._id,
        certificateType: formData.certificateType,
        academicSession: currentSession?.sessionName || selectedStudent.currentSession,
        reasonForLeaving: formData.reasonForLeaving,
        conduct: formData.conduct,
        feeClearedTill: formData.feeClearedTill
      };

      const res = await api.post('/certificates', payload);
      if (res.data.success) {
        toast.success(res.data.message);
        setIssueModalOpen(false);
        setSelectedCert(res.data.data);
        setPreviewModalOpen(true);
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue certificate');
    }
  };

  const openPreview = (cert) => {
    setSelectedCert(cert);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Certificate Generation Studio
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Generate printable Transfer Certificates (TC), Bonafide Certificates, Character Certificates, and Fee Dues Clearance
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setIssueModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Certificate</span>
        </button>
      </div>

      {/* Certificates Table */}
      <div className="app-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No certificates issued yet"
            description="Issue official Transfer Certificates (TC) or Bonafide certificates for registered students."
            actionLabel="Issue First Certificate"
            onAction={() => setIssueModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                  <th className="py-3 px-4">Certificate No</th>
                  <th className="py-3 px-4">Certificate Type</th>
                  <th className="py-3 px-4">Student & Admission No</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {cert.certificateNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-[11px]">
                        {cert.certificateType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{cert.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Adm: {cert.admissionNo}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      Class {cert.className} {cert.sectionName ? `(${cert.sectionName})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPreview(cert)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs ml-auto transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print A4</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Issue Certificate */}
      <Modal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} title="Issue Student Certificate">
        <form onSubmit={handleIssue} className="space-y-4">
          {!selectedStudent ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Search Student *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => searchStudents(e.target.value)}
                  placeholder="Type student name or admission number..."
                  className="app-input pl-9 w-full text-xs"
                />
              </div>

              {studentResults.length > 0 && (
                <div className="mt-2 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-40 overflow-y-auto space-y-1">
                  {studentResults.map((st) => (
                    <button
                      key={st._id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st);
                        setStudentResults([]);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-xs flex justify-between"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{st.studentName}</span>
                      <span className="text-slate-500 font-mono">Adm: {st.admissionNo} • Class {st.currentClass}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-blue-900 dark:text-blue-300">{selectedStudent.studentName}</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  Adm: {selectedStudent.admissionNo} • Class {selectedStudent.currentClass}-{selectedStudent.currentSection}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Change Student
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Certificate Document Type *
            </label>
            <select
              value={formData.certificateType}
              onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
              className="app-select w-full text-xs font-bold"
            >
              <option value="BONAFIDE">Bonafide Certificate</option>
              <option value="TRANSFER_CERTIFICATE">School Leaving / Transfer Certificate (TC)</option>
              <option value="CHARACTER">Character & Conduct Certificate</option>
              <option value="STUDY_CERTIFICATE">Study Certificate</option>
              <option value="FEE_DUES">Fee Clearance / No Dues Certificate</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Conduct</label>
              <input
                type="text"
                value={formData.conduct}
                onChange={(e) => setFormData({ ...formData, conduct: e.target.value })}
                className="app-input w-full text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Cleared Up To</label>
              <input
                type="text"
                value={formData.feeClearedTill}
                onChange={(e) => setFormData({ ...formData, feeClearedTill: e.target.value })}
                className="app-input w-full text-xs"
              />
            </div>
          </div>

          {formData.certificateType === 'TRANSFER_CERTIFICATE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Leaving School</label>
              <input
                type="text"
                value={formData.reasonForLeaving}
                onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                placeholder="e.g. Parent job transfer / Higher studies"
                className="app-input w-full text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStudent}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md disabled:opacity-50"
            >
              Generate Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Printable A4 Preview */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Official Certificate Print Preview"
        subtitle={`Certificate No: ${selectedCert?.certificateNo}`}
      >
        {selectedCert && (
          <div className="space-y-6">
            {/* A4 Certificate Paper Frame */}
            <div className="p-8 rounded-2xl border-4 border-double border-slate-400 bg-white text-slate-900 space-y-6 text-center shadow-lg">
              {/* Header */}
              <div className="border-b-2 border-slate-300 pb-4">
                <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                  GOVERNMENT OF MADHYA PRADESH • SCHOOL EDUCATION DEPARTMENT
                </p>
                <h1 className="text-lg font-black tracking-tight text-blue-900 mt-1">
                  GOVERNMENT MODEL HIGHER SECONDARY SCHOOL OF EXCELLENCE
                </h1>
                <p className="text-xs text-slate-600">Shivaji Nagar, Bhopal, MP - Affiliation: MPBSE-SCH-712049</p>
              </div>

              {/* Certificate Title Badge */}
              <div className="py-2">
                <span className="inline-block px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-blue-50 text-blue-900 border-2 border-blue-300">
                  {selectedCert.certificateType.replace('_', ' ')}
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Certificate No: {selectedCert.certificateNo}</p>
              </div>

              {/* Body Text */}
              <div className="text-xs text-slate-800 leading-loose text-justify px-4">
                This is to certify that Master / Miss <strong className="text-slate-950 font-black underline">{selectedCert.studentName}</strong>, 
                holding Admission Number <strong className="font-mono">{selectedCert.admissionNo}</strong>, is / was a bonafide student of Class <strong className="font-bold">{selectedCert.className}</strong> ({selectedCert.sectionName}) of this institution during the Academic Session <strong className="font-bold">{selectedCert.academicSession}</strong>.
                <br />
                According to the school registers, his / her general conduct and character have been found to be <strong className="font-bold">{selectedCert.conduct || 'Exemplary'}</strong>. 
                {selectedCert.feeClearedTill && (
                  <span> All school dues and terminal fees have been satisfactorily cleared up to <strong className="font-bold">{selectedCert.feeClearedTill}</strong>.</span>
                )}
                {selectedCert.reasonForLeaving && (
                  <span> The student is leaving the school due to: <strong className="italic">{selectedCert.reasonForLeaving}</strong>.</span>
                )}
                <br />
                We wish the student all success and prosperity in all future academic pursuits.
              </div>

              {/* Date & Seal */}
              <div className="pt-10 flex items-end justify-between text-xs px-4">
                <div className="text-left">
                  <p className="text-slate-500">Date of Issue: <strong>{new Date(selectedCert.issueDate).toLocaleDateString('en-IN')}</strong></p>
                  <p className="text-slate-500">Place: <strong>Bhopal (M.P.)</strong></p>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-400">
                  INSTITUTION SEAL
                </div>

                <div className="text-center">
                  <div className="h-10 border-b border-slate-400 w-32 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-900">Principal / Headmaster</p>
                  <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate (A4)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
