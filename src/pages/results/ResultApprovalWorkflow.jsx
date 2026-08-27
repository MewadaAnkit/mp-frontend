import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ResultApprovalWorkflow() {
  const { currentSession, classes } = useAcademic();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedStage, setSelectedStage] = useState('ALL');

  const [results, setResults] = useState([]);
  const [selectedResultIds, setSelectedResultIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const loadResults = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      let url = `/results?examinationId=${selectedExamId}&className=${selectedClass}`;
      if (selectedStage !== 'ALL') url += `&approvalStage=${selectedStage}`;

      const res = await api.get(url);
      if (res.data.success) {
        setResults(res.data.data);
        setSelectedResultIds([]);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [selectedExamId, selectedClass, selectedStage]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage, pageSize]);

  const toggleSelect = (id) => {
    if (selectedResultIds.includes(id)) {
      setSelectedResultIds(selectedResultIds.filter(i => i !== id));
    } else {
      setSelectedResultIds([...selectedResultIds, id]);
    }
  };

  const handleStageTransition = async (targetStage) => {
    if (selectedResultIds.length === 0) {
      toast.error('Please select at least one result');
      return;
    }
    setUpdating(true);
    try {
      const res = await api.put('/results/approval-stage', {
        resultIds: selectedResultIds,
        targetStage
      });
      if (res.data.success) {
        toast.success(res.data.message);
        loadResults();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval transition failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Multi-Stage Result Approval Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Strict verification workflow: Draft → Teacher Submitted → Verified → Approved → Published</p>
        </div>
      </div>

      {/* Stage Flow Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 app-card p-4 text-xs">
        <div className="app-card-subtle p-3 text-center">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Stage 1</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">DRAFT</span>
        </div>
        <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-center">
          <span className="text-blue-600 dark:text-blue-400 block text-[10px] uppercase font-bold">Stage 2</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">TEACHER SUBMITTED</span>
        </div>
        <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-center">
          <span className="text-purple-600 dark:text-purple-400 block text-[10px] uppercase font-bold">Stage 3</span>
          <span className="font-bold text-purple-700 dark:text-purple-300">EXAM VERIFIED</span>
        </div>
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-center">
          <span className="text-amber-600 dark:text-amber-400 block text-[10px] uppercase font-bold">Stage 4</span>
          <span className="font-bold text-amber-700 dark:text-amber-300">PRINCIPAL APPROVED</span>
        </div>
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-center col-span-2 sm:col-span-1">
          <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-bold">Stage 5</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">PUBLISHED</span>
        </div>
      </div>

      {/* Filters Bar */}
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
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Stage Filter</label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full app-input font-bold"
          >
            <option value="ALL">All Approval Stages</option>
            <option value="DRAFT">Draft</option>
            <option value="TEACHER_SUBMITTED">Teacher Submitted</option>
            <option value="EXAMINATION_VERIFIED">Examination Verified</option>
            <option value="PRINCIPAL_APPROVED">Principal Approved</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* Results Table with Batch Approval Action */}
      <div className="app-card overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedResultIds(selectedResultIds.length === results.length ? [] : results.map(r => r._id))}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {selectedResultIds.length === results.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              ({selectedResultIds.length} of {results.length} selected)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStageTransition('TEACHER_SUBMITTED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-secondary disabled:opacity-50"
            >
              Submit to Exam In-Charge
            </button>
            <button
              onClick={() => handleStageTransition('EXAMINATION_VERIFIED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-purple disabled:opacity-50"
            >
              Verify Marks
            </button>
            <button
              onClick={() => handleStageTransition('PRINCIPAL_APPROVED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-amber disabled:opacity-50"
            >
              Approve (Principal)
            </button>
            <button
              onClick={() => handleStageTransition('PUBLISHED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-success disabled:opacity-50"
            >
              Publish Results
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 w-10">Select</th>
                <th className="px-5 py-3.5">Roll / Adm</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Total Marks</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Grade</th>
                <th className="px-5 py-3.5">Result</th>
                <th className="px-5 py-3.5 text-right">Approval Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedResultIds.includes(r._id)}
                        onChange={() => toggleSelect(r._id)}
                        className="rounded app-input cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400">
                      #{r.rollNo} <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">{r.admissionNo}</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.studentId?.studentName || r.admissionNo}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold">
                      {r.grandTotalObtained} / {r.grandTotalMax}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                      {r.overallPercentage}%
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-purple-600 dark:text-purple-400">
                      {r.overallGrade || '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={r.resultStatus === 'PASS' ? 'app-badge-green' : 'app-badge-red'}>
                        {r.resultStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="app-badge-blue">
                        {r.approvalStage}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-slate-400 font-medium">
                    No results calculated for this selection yet. Run calculation in Marks Entry first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={results.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>
    </div>
  );
}
