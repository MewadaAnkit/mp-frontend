import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { FileCheck2, Download, Archive, Unlock, Eye, Sparkles } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function PublishedResults() {
  const { currentSession, classes } = useAcademic();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSection, setSelectedSection] = useState('A');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenTargetId, setReopenTargetId] = useState(null);
  const [reopenReason, setReopenReason] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 9 fits 3x3 grid

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`);
        if (res.data.success && res.data.data.length > 0) {
          setExams(res.data.data);
          setSelectedExamId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadExams();
  }, [currentSession]);

  const loadPublishedResults = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/results?examinationId=${selectedExamId}&className=${selectedClass}&sectionName=${selectedSection}&approvalStage=PUBLISHED`);
      if (res.data.success) {
        setResults(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublishedResults();
  }, [selectedExamId, selectedClass, selectedSection]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage, pageSize]);

  const handleDownloadPdf = (resultId) => {
    const token = localStorage.getItem('mp_rms_token');
    window.open(`${api.defaults.baseURL}/results/${resultId}/pdf?token=${token || ''}`, '_blank');
  };

  const handleDownloadBulkZip = () => {
    const token = localStorage.getItem('mp_rms_token');
    window.open(`${api.defaults.baseURL}/results/bulk-download?examinationId=${selectedExamId}&className=${selectedClass}&sectionName=${selectedSection}&token=${token || ''}`, '_blank');
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason) {
      toast.error('Reopen reason is mandatory');
      return;
    }
    try {
      const res = await api.put(`/results/${reopenTargetId}/reopen`, { reason: reopenReason });
      if (res.data.success) {
        toast.success('Result reopened successfully');
        setShowReopenModal(false);
        setReopenReason('');
        loadPublishedResults();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen result');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Published Marksheets & Official Certificates</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Download dynamic MP Board report cards with embedded QR verification</p>
        </div>

        {results.length > 0 && (
          <button
            onClick={handleDownloadBulkZip}
            className="app-btn-success"
          >
            <Archive className="w-4 h-4" />
            <span>Bulk Download (ZIP)</span>
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-4">
        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full app-input font-bold"
          >
            {exams.map(e => <option key={e._id} value={e._id}>{e.examName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full app-input font-bold"
          >
            {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full app-input font-bold"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Published Marksheets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedResults.map((r) => (
          <div key={r._id} className="app-card p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="app-badge-green font-mono">{r.verificationCode}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{r.studentId?.studentName || r.admissionNo}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Roll #{r.rollNo} • Adm: {r.admissionNo}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{r.overallPercentage}%</span>
                <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400">Grade: {r.overallGrade}</span>
              </div>
            </div>

            <div className="app-card-subtle p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Division:</span>
                <span className="font-bold text-slate-900 dark:text-white">{r.division || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Grand Total:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{r.grandTotalObtained} / {r.grandTotalMax}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleDownloadPdf(r._id)}
                className="app-btn-primary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Marksheet</span>
              </button>

              <button
                onClick={() => {
                  setReopenTargetId(r._id);
                  setShowReopenModal(true);
                }}
                title="Reopen published result for corrections"
                className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 font-bold flex items-center gap-1 transition"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reopen</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      {results.length > 0 && (
        <div className="app-card overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalItems={results.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 9, 18, 36]}
          />
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="app-card-subtle p-10 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm font-semibold">No published marksheets found for this class and examination.</p>
          <p className="text-xs text-slate-400 mt-1">Make sure you have completed the Result Approval Workflow to Stage 5 (Published).</p>
        </div>
      )}

      {/* Reopen Reason Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reopen Published Result</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reopening a published marksheet will revert it to Draft status and log an official audit reason.
            </p>

            <form onSubmit={handleReopen} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Audit Reason *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Scrutiny correction in Mathematics theory marks by Subject Teacher..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full app-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-amber"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
