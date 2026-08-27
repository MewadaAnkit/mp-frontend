import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { FileSpreadsheet, Upload, Save, Play, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarksEntryPage() {
  const { currentSession, classes } = useAcademic();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [students, setStudents] = useState([]);
  const [existingMarks, setExistingMarks] = useState({});
  const [marksGrid, setMarksGrid] = useState({});
  const [resolvedComponents, setResolvedComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Bulk modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  // 1. Load active exams & subjects
  useEffect(() => {
    const init = async () => {
      try {
        const [exRes, subRes] = await Promise.all([
          api.get(`/examinations?sessionName=${currentSession?.sessionName || '2025-26'}`),
          api.get(`/subjects?className=${selectedClass}`)
        ]);

        if (exRes.data.success && exRes.data.data.length > 0) {
          setExams(exRes.data.data);
          if (!selectedExamId) setSelectedExamId(exRes.data.data[0]._id);
        }

        if (subRes.data.success && subRes.data.data.length > 0) {
          setSubjects(subRes.data.data);
          setSelectedSubjectId(subRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [currentSession, selectedClass]);

  // 2. Load students & existing marks whenever exam/class/section/subject changes
  const loadClassMarks = async () => {
    if (!selectedExamId || !selectedSubjectId) return;
    setLoading(true);

    try {
      const activeSubject = subjects.find(s => s._id === selectedSubjectId);
      const activeExam = exams.find(e => e._id === selectedExamId);

      let comps = [];
      if (activeSubject?.components && activeSubject.components.length > 0) {
        comps = activeSubject.components;
      } else if (activeExam?.schemeId?.components) {
        comps = activeExam.schemeId.components.map(c => ({
          name: c.name,
          code: c.code,
          maxMarks: c.defaultMaxMarks
        }));
      } else {
        comps = [{ name: 'Theory', code: 'TH', maxMarks: 80 }, { name: 'Internal', code: 'PR', maxMarks: 20 }];
      }
      setResolvedComponents(comps);

      const [stuRes, markRes] = await Promise.all([
        api.get(`/students?sessionName=${currentSession?.sessionName || '2025-26'}&className=${selectedClass}&sectionName=${selectedSection}`),
        api.get(`/marks?examinationId=${selectedExamId}&className=${selectedClass}&sectionName=${selectedSection}&subjectId=${selectedSubjectId}`)
      ]);

      const stuList = stuRes.data.success ? stuRes.data.data : [];
      setStudents(stuList);

      const existingMap = {};
      const gridMap = {};

      if (markRes.data.success) {
        markRes.data.data.forEach(m => {
          existingMap[m.studentId?._id || m.studentId] = m;
        });
      }

      stuList.forEach(st => {
        const markDoc = existingMap[st._id];
        gridMap[st._id] = {};
        comps.forEach(c => {
          const compVal = markDoc?.components?.find(x => x.componentCode === c.code);
          gridMap[st._id][c.code] = compVal ? compVal.obtainedMarks : '';
        });
      });

      setExistingMarks(existingMap);
      setMarksGrid(gridMap);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load marks grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassMarks();
  }, [selectedExamId, selectedClass, selectedSection, selectedSubjectId, subjects]);

  const handleCellChange = (studentId, compCode, val) => {
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [compCode]: val
      }
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const entries = students.map(st => {
        const studentMarks = marksGrid[st._id] || {};
        const components = resolvedComponents.map(c => {
          const rawVal = studentMarks[c.code];
          let obt = Number(rawVal);
          let status = 'PRESENT';
          if (String(rawVal).toUpperCase() === 'AB' || String(rawVal).toUpperCase() === 'ABSENT') {
            status = 'ABSENT';
            obt = 0;
          } else if (isNaN(obt)) {
            obt = 0;
          }

          return {
            componentCode: c.code,
            componentName: c.name,
            maxMarks: c.maxMarks,
            obtainedMarks: obt,
            attendanceStatus: status
          };
        });

        return { studentId: st._id, components };
      });

      const res = await api.post('/marks/grid', {
        examinationId: selectedExamId,
        subjectId: selectedSubjectId,
        entries
      });

      if (res.data.success) {
        toast.success(`Marks saved for ${res.data.successCount} students!`);
        loadClassMarks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateClassResults = async () => {
    setCalculating(true);
    try {
      const res = await api.post('/results/calculate-class', {
        examinationId: selectedExamId,
        className: selectedClass,
        sectionName: selectedSection
      });

      if (res.data.success) {
        toast.success(`Calculated results for ${res.data.data.successCount} students!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleBulkMarksUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error('Please select an Excel or CSV file');
      return;
    }
    const data = new FormData();
    data.append('file', bulkFile);
    data.append('examinationId', selectedExamId);
    data.append('subjectId', selectedSubjectId);

    try {
      const res = await api.post('/marks/bulk-import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`Bulk imported marks for ${res.data.data.successCount} students!`);
        setShowBulkModal(false);
        setBulkFile(null);
        loadClassMarks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk marks import failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Interactive Marks Entry & Calculation</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dynamic multi-component evaluation grid based on active scheme</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="app-btn-secondary"
          >
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleCalculateClassResults}
            disabled={calculating || students.length === 0}
            className="app-btn-purple disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{calculating ? 'Calculating...' : 'Run Auto-Calculation'}</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 app-card p-4">
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

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full app-input font-bold"
          >
            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>)}
          </select>
        </div>
      </div>

      {/* Grid Marks Table Card */}
      <div className="app-card overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Subject Max: {resolvedComponents.reduce((acc, c) => acc + c.maxMarks, 0)} Marks
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ({resolvedComponents.map(c => `${c.name}: ${c.maxMarks}`).join(' + ')})
            </span>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving || students.length === 0}
            className="app-btn-success disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Marks Grid'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Roll</th>
                <th className="px-5 py-3.5">Admission No</th>
                <th className="px-5 py-3.5">Student Name</th>
                {resolvedComponents.map(comp => (
                  <th key={comp.code} className="px-5 py-3.5 text-center">
                    {comp.name} (Max {comp.maxMarks})
                  </th>
                ))}
                <th className="px-5 py-3.5 text-center">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
              {students.length > 0 ? (
                students.map((st) => {
                  const studentMarks = marksGrid[st._id] || {};
                  let totalObt = 0;
                  let hasExcess = false;

                  resolvedComponents.forEach(c => {
                    const v = Number(studentMarks[c.code]) || 0;
                    if (v > c.maxMarks) hasExcess = true;
                    totalObt += v;
                  });

                  return (
                    <tr key={st._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3 font-black text-blue-600 dark:text-blue-400">#{st.currentRollNo}</td>
                      <td className="px-5 py-3 font-mono font-semibold text-slate-600 dark:text-slate-300">{st.admissionNo}</td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{st.studentName}</td>

                      {resolvedComponents.map(comp => {
                        const val = studentMarks[comp.code] !== undefined ? studentMarks[comp.code] : '';
                        const isInvalid = Number(val) > comp.maxMarks || Number(val) < 0;

                        return (
                          <td key={comp.code} className="px-5 py-3 text-center">
                            <input
                              type="text"
                              value={val}
                              placeholder="0"
                              onChange={(e) => handleCellChange(st._id, comp.code, e.target.value)}
                              className={`w-20 text-center py-1.5 px-2 rounded-xl text-xs font-extrabold focus:outline-none transition ${
                                isInvalid
                                  ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 dark:bg-rose-950/80 dark:border-rose-500 dark:text-rose-300'
                                  : 'app-input font-bold'
                              }`}
                            />
                          </td>
                        );
                      })}

                      <td className="px-5 py-3 text-center font-black">
                        <span className={hasExcess ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {totalObt} / {resolvedComponents.reduce((acc, c) => acc + c.maxMarks, 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4 + resolvedComponents.length} className="px-5 py-10 text-center text-slate-400 font-medium">
                    No enrolled students found in Class {selectedClass} ('{selectedSection}').
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Marks Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Upload Subject Marks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload Excel sheet with columns: AdmissionNo, {resolvedComponents.map(c => c.code).join(', ')}
            </p>

            <form onSubmit={handleBulkMarksUpload} className="space-y-4 text-xs">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setBulkFile(e.target.files[0])}
                className="w-full app-input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-purple"
                >
                  Import Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
