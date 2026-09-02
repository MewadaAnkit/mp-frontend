import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentPromotion() {
  const { sessions, currentSession, classes, reloadMetadata } = useAcademic();
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('A');
  // BUG-008 FIX: Default target session to first non-current session (not hardcoded '2026-27')
  const [targetSession, setTargetSession] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('A');
  const [targetStream, setTargetStream] = useState('');

  // Initialize defaults from loaded sessions/classes
  useEffect(() => {
    if (classes && classes.length > 0 && !sourceClass) {
      setSourceClass(classes[0].className);
      setTargetClass(classes[0].className);
    }
  }, [classes]);

  useEffect(() => {
    if (sessions && sessions.length > 0 && !targetSession) {
      // Default to first non-current session
      const nonCurrent = sessions.find(s => !s.isCurrent);
      if (nonCurrent) setTargetSession(nonCurrent.sessionName);
      else setTargetSession(sessions[0].sessionName);
    }
  }, [sessions]);

  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students?sessionName=${currentSession?.sessionName || '2025-26'}&className=${sourceClass}&sectionName=${sourceSection}`);
      if (res.data.success) {
        setStudents(res.data.data);
        setSelectedIds(res.data.data.map(s => s._id)); // Default select all
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [sourceClass, sourceSection, currentSession]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    if (!targetSession) {
      toast.error('Please select a valid target session');
      return;
    }
    // Confirmation dialog for safety before mass-promotion
    const confirmed = window.confirm(
      `Are you sure you want to promote ${selectedIds.length} student(s) to Class ${targetClass}, Section ${targetSection} in session ${targetSession}?\n\nThis action will update all selected students' records.`
    );
    if (!confirmed) return;
    setPromoting(true);
    try {
      const res = await api.post('/students/promote', {
        studentIds: selectedIds,
        fromSession: currentSession?.sessionName || '2025-26',
        toSession: targetSession,
        toClass: targetClass,
        toSection: targetSection,
        toStream: targetStream,
        status: 'PROMOTED'
      });

      if (res.data.success) {
        toast.success(`Successfully promoted ${res.data.data.successCount} students to Class ${targetClass} (${targetSession})!`);
        reloadMetadata();
        loadStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Student Annual Promotion Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Promote students across academic sessions while preserving permanent academic history</p>
      </div>

      {/* Promotion Config Box */}
      <div className="app-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Source Box */}
          <div className="app-card-subtle p-5 space-y-3 text-xs">
            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Source Placement (Current)</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Session</label>
                <input
                  type="text"
                  disabled
                  value={currentSession?.sessionName || '2025-26'}
                  className="w-full app-input font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Class</label>
                <select
                  value={sourceClass}
                  onChange={(e) => setSourceClass(e.target.value)}
                  className="w-full app-input font-bold"
                >
                  {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Section</label>
                <select
                  value={sourceSection}
                  onChange={(e) => setSourceSection(e.target.value)}
                  className="w-full app-input font-bold"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Box */}
          <div className="app-card-subtle p-5 border border-blue-500/30 space-y-3 text-xs">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Target Promotion Placement</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Target Session</label>
                <select
                  value={targetSession}
                  onChange={(e) => setTargetSession(e.target.value)}
                  className="w-full app-input font-bold"
                >
                  {sessions.map(s => <option key={s._id} value={s.sessionName}>{s.sessionName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Target Class</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full app-input font-bold"
                >
                  {classes.map(c => <option key={c._id} value={c.className}>Class {c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Target Section</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full app-input font-bold"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Student Selection Table */}
        <div className="app-card-subtle overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-extrabold text-slate-900 dark:text-white">
              Select Students to Promote ({selectedIds.length} of {students.length} selected)
            </span>
            <button
              onClick={() => setSelectedIds(selectedIds.length === students.length ? [] : students.map(s => s._id))}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
            >
              {selectedIds.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {students.map(st => (
              <div
                key={st._id}
                onClick={() => toggleSelect(st._id)}
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(st._id)}
                    onChange={() => {}}
                    className="rounded app-input cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{st.studentName}</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Roll #{st.currentRollNo} • Adm: {st.admissionNo}</span>
                  </div>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{st.fatherName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePromote}
            disabled={promoting || selectedIds.length === 0}
            className="app-btn-success disabled:opacity-50"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{promoting ? 'Promoting Students...' : `Execute Promotion (${selectedIds.length} Students)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
