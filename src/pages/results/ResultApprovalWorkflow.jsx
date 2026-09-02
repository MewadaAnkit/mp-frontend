import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import { ShieldCheck, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultApprovalWorkflow() {
  const { currentSession, classes } = useAcademic();
  const { t, isHindi } = useLanguage();
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
        toast.success(res.data.message || 'Approval stage updated successfully!');
        loadResults();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval transition failed');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      header: 'Roll / Adm',
      accessor: (r) => (
        <div>
          <span className="font-bold text-blue-600 dark:text-blue-400">Roll #{r.rollNo}</span>
          <span className="block text-[11px] text-slate-500 font-mono font-medium">Adm: {r.admissionNo}</span>
        </div>
      )
    },
    {
      header: 'Student Name',
      accessor: (r) => (
        <span className="font-bold text-slate-900 dark:text-white">{r.studentId?.studentName || r.admissionNo}</span>
      )
    },
    {
      header: 'Total Marks',
      accessor: (r) => (
        <span className="font-mono font-semibold">
          {r.grandTotalObtained} / {r.grandTotalMax}
        </span>
      )
    },
    {
      header: 'Percentage',
      accessor: (r) => <span className="font-black text-slate-900 dark:text-white">{r.overallPercentage}%</span>
    },
    {
      header: 'Grade',
      accessor: (r) => (
        <span className="font-extrabold text-purple-600 dark:text-purple-400">{r.overallGrade || '—'}</span>
      )
    },
    {
      header: 'Result',
      accessor: (r) => <StatusBadge status={r.resultStatus || 'N/A'} size="xs" />
    },
    {
      header: 'Approval Stage',
      className: 'text-right',
      accessor: (r) => <StatusBadge status={r.approvalStage || 'DRAFT'} size="xs" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Multi-Stage Result Approval Pipeline"
        subtitle="Verification workflow: Draft → Teacher Submitted → Examination Verified → Principal Approved → Published"
        icon={ShieldCheck}
        breadcrumbs={[{ label: 'Examinations & Results' }, { label: 'Result Approval' }]}
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            {results.length} Calculated Results
          </span>
        }
      />

      {/* Stage Flow Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 app-card p-4 text-xs">
        <div className="app-card-subtle p-3 text-center">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Stage 1</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">DRAFT</span>
        </div>
        <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-center">
          <span className="text-blue-500 block text-[10px] uppercase font-bold">Stage 2</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">TEACHER SUBMITTED</span>
        </div>
        <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-center">
          <span className="text-purple-500 block text-[10px] uppercase font-bold">Stage 3</span>
          <span className="font-bold text-purple-700 dark:text-purple-300">EXAM VERIFIED</span>
        </div>
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-center">
          <span className="text-amber-500 block text-[10px] uppercase font-bold">Stage 4</span>
          <span className="font-bold text-amber-700 dark:text-amber-300">PRINCIPAL APPROVED</span>
        </div>
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-center col-span-2 sm:col-span-1">
          <span className="text-emerald-500 block text-[10px] uppercase font-bold">Stage 5</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">PUBLISHED</span>
        </div>
      </div>

      {/* Main Results Table with Batch Approval Action */}
      <DataTable
        columns={columns}
        data={paginatedResults}
        loading={loading}
        selectable
        selectedKeys={selectedResultIds}
        onSelectChange={setSelectedResultIds}
        keyField="_id"
        emptyIcon={Award}
        emptyTitle="No results in this approval stage"
        emptyDescription="Run result calculation in the Marks Entry module to populate candidate scores for approval."
        filterControls={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="app-input text-xs font-bold min-w-[180px]"
            >
              {exams.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.examName}
                </option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="app-input text-xs font-bold min-w-[110px]"
            >
              {classes.map((c) => (
                <option key={c._id} value={c.className}>
                  Class {c.className}
                </option>
              ))}
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="app-input text-xs font-bold min-w-[150px]"
            >
              <option value="ALL">All Stages</option>
              <option value="DRAFT">Draft</option>
              <option value="TEACHER_SUBMITTED">Teacher Submitted</option>
              <option value="EXAMINATION_VERIFIED">Exam Verified</option>
              <option value="PRINCIPAL_APPROVED">Principal Approved</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleStageTransition('TEACHER_SUBMITTED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-secondary text-xs"
            >
              Submit
            </button>
            <button
              onClick={() => handleStageTransition('EXAMINATION_VERIFIED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-purple text-xs"
            >
              Verify
            </button>
            <button
              onClick={() => handleStageTransition('PRINCIPAL_APPROVED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-amber text-xs"
            >
              Approve
            </button>
            <button
              onClick={() => handleStageTransition('PUBLISHED')}
              disabled={updating || selectedResultIds.length === 0}
              className="app-btn-success text-xs"
            >
              Publish ({selectedResultIds.length})
            </button>
          </div>
        }
        pagination={{
          page: currentPage,
          totalPages: Math.ceil(results.length / pageSize) || 1,
          totalItems: results.length,
          limit: pageSize,
          onPageChange: setCurrentPage
        }}
      />
    </div>
  );
}

