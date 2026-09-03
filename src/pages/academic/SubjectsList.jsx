import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { 
  BookOpen, Plus, Search, Trash2, Edit, CheckCircle2, 
  X, Table, LayoutGrid, Award, Check
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const DEFAULT_FORM_STATE = {
  subjectName: '',
  subjectCode: '',
  applicableClasses: ['9'],
  streamName: '',
  subjectType: 'COMPULSORY',
  totalMaxMarks: 100,
  totalPassingMarks: 33,
  components: [
    { name: 'Theory Examination', code: 'TH', type: 'THEORY', maxMarks: 75, passingMarks: 25 },
    { name: 'Internal Assessment / Project', code: 'PR', type: 'PRACTICAL', maxMarks: 25, passingMarks: 8 }
  ]
};

export default function SubjectsList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // View Mode: 'table' (default) or 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / Edit Subject Modal
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Delete Subject Confirmation Dialog
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const url = selectedClass === 'ALL' ? '/subjects' : `/subjects?className=${selectedClass}`;
      const res = await api.get(url);
      if (res.data.success) {
        setSubjects(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [selectedClass]);

  // Adjust default page size when switching view modes
  useEffect(() => {
    if (viewMode === 'table' && pageSize === 9) {
      setPageSize(10);
    } else if (viewMode === 'grid' && pageSize === 10) {
      setPageSize(9);
    }
  }, [viewMode]);

  // Filtered & Paginated Subjects
  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects;
    const term = searchTerm.toLowerCase();
    return subjects.filter(
      s => (s.subjectName && s.subjectName.toLowerCase().includes(term)) || 
           (s.subjectCode && s.subjectCode.toLowerCase().includes(term)) ||
           (s.streamName && s.streamName.toLowerCase().includes(term))
    );
  }, [subjects, searchTerm]);

  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(start, start + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      ...DEFAULT_FORM_STATE,
      applicableClasses: selectedClass !== 'ALL' ? [selectedClass] : ['9']
    });
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (sub) => {
    setEditingSubject(sub);
    setFormData({
      subjectName: sub.subjectName || '',
      subjectCode: sub.subjectCode || '',
      applicableClasses: sub.applicableClasses || [],
      streamName: sub.streamName || '',
      subjectType: sub.subjectType || 'COMPULSORY',
      totalMaxMarks: sub.totalMaxMarks || 100,
      totalPassingMarks: sub.totalPassingMarks || 33,
      components: sub.components && sub.components.length > 0
        ? sub.components.map(c => ({
            name: c.name || '',
            code: c.code || 'TH',
            type: c.type || 'THEORY',
            maxMarks: c.maxMarks ?? 75,
            passingMarks: c.passingMarks ?? 25
          }))
        : [
            { name: 'Theory Examination', code: 'TH', type: 'THEORY', maxMarks: 75, passingMarks: 25 },
            { name: 'Internal Assessment', code: 'IA', type: 'PRACTICAL', maxMarks: 25, passingMarks: 8 }
          ]
    });
    setShowModal(true);
  };

  // Component management in modal
  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = (field === 'maxMarks' || field === 'passingMarks') 
      ? (value === '' ? '' : Number(value)) 
      : value;
    
    const totalMax = updated.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
    const totalPass = updated.reduce((acc, c) => acc + (Number(c.passingMarks) || 0), 0);

    setFormData(prev => ({
      ...prev,
      components: updated,
      totalMaxMarks: totalMax || 100,
      totalPassingMarks: totalPass || 33
    }));
  };

  const addComponentRow = () => {
    const updated = [
      ...formData.components,
      { name: 'Practical Lab / Viva', code: 'PR', type: 'PRACTICAL', maxMarks: 20, passingMarks: 7 }
    ];
    const totalMax = updated.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
    const totalPass = updated.reduce((acc, c) => acc + (Number(c.passingMarks) || 0), 0);

    setFormData(prev => ({
      ...prev,
      components: updated,
      totalMaxMarks: totalMax || 100,
      totalPassingMarks: totalPass || 33
    }));
  };

  const removeComponentRow = (index) => {
    if (formData.components.length === 1) {
      toast.error('Subject must have at least one assessment component');
      return;
    }
    const updated = formData.components.filter((_, i) => i !== index);
    const totalMax = updated.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
    const totalPass = updated.reduce((acc, c) => acc + (Number(c.passingMarks) || 0), 0);

    setFormData(prev => ({
      ...prev,
      components: updated,
      totalMaxMarks: totalMax || 100,
      totalPassingMarks: totalPass || 33
    }));
  };

  const toggleClassSelection = (cls) => {
    setFormData(prev => {
      const exists = prev.applicableClasses.includes(cls);
      return {
        ...prev,
        applicableClasses: exists
          ? prev.applicableClasses.filter(c => c !== cls)
          : [...prev.applicableClasses, cls]
      };
    });
  };

  // Submit Handler for Create & Edit
  const handleSubmitSubject = async (e) => {
    e.preventDefault();
    if (!formData.subjectName.trim() || !formData.subjectCode.trim()) {
      toast.error('Please enter Subject Name and Code');
      return;
    }
    if (formData.applicableClasses.length === 0) {
      toast.error('Please select at least one applicable class');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        const res = await api.put(`/subjects/${editingSubject._id}`, formData);
        if (res.data.success) {
          toast.success(`Subject "${formData.subjectName}" updated successfully!`);
          setShowModal(false);
          setEditingSubject(null);
          loadSubjects();
        }
      } else {
        const res = await api.post('/subjects', formData);
        if (res.data.success) {
          toast.success(`Subject "${formData.subjectName}" registered successfully!`);
          setShowModal(false);
          loadSubjects();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm and Execute Delete
  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    setDeleting(true);
    try {
      const url = selectedClass !== 'ALL' 
        ? `/subjects/${subjectToDelete._id}?className=${selectedClass}` 
        : `/subjects/${subjectToDelete._id}`;
      const res = await api.delete(url);
      if (res.data.success) {
        toast.success(res.data.message || `Subject "${subjectToDelete.subjectName}" deleted successfully`);
        setSubjectToDelete(null);
        loadSubjects();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  // Helper for type badges
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'COMPULSORY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20">
            Compulsory
          </span>
        );
      case 'ELECTIVE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20">
            Elective
          </span>
        );
      case 'OPTIONAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/20">
            Optional
          </span>
        );
      case 'VOCATIONAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/20">
            Vocational
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {type || 'Standard'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Subject Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Configure subjects, assessment distributions, and stream tracks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#151d30] rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="app-btn-primary cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* Clean Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-3 sm:p-4">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subjects by name, code, stream..."
            className="w-full app-input !pl-10 !py-2.5 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full app-input !py-2.5 font-bold"
          >
            <option value="ALL">All Classes (1 to 12)</option>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading subjects curriculum...</p>
        </div>
      )}

      {/* TABLE VIEW (Default) */}
      {!loading && viewMode === 'table' && paginatedSubjects.length > 0 && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-32">Subject Code</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Subject Name</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Applicable Classes</th>
                  <th className="py-3.5 px-4 w-28">Type</th>
                  <th className="py-3.5 px-4 w-28 text-center">Marks (Max / Pass)</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Assessment Breakdown</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {paginatedSubjects.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* Subject Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-500/20">
                        {sub.subjectCode}
                      </span>
                    </td>

                    {/* Subject Name */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white text-[13px] block">
                          {sub.subjectName}
                        </span>
                        {sub.streamName && (
                          <span className="inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-500/20">
                            Stream: {sub.streamName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Classes */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {sub.applicableClasses && sub.applicableClasses.length > 0 ? (
                          sub.applicableClasses.map(cls => (
                            <span 
                              key={cls}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200/60 dark:border-slate-700/60"
                            >
                              Class {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">All Classes</span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderTypeBadge(sub.subjectType)}
                    </td>

                    {/* Marks */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {sub.totalMaxMarks} Marks
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Pass: {sub.totalPassingMarks}
                        </span>
                      </div>
                    </td>

                    {/* Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {sub.components && sub.components.length > 0 ? (
                          sub.components.map((comp, idx) => (
                            <div 
                              key={idx}
                              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50"
                            >
                              <span className="font-semibold text-slate-600 dark:text-slate-400">{comp.name}</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {comp.maxMarks}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                (P:{comp.passingMarks || 0})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">Single Component</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sub)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                          title={`Edit ${sub.subjectName}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubjectToDelete(sub)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title={`Delete ${sub.subjectName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {!loading && viewMode === 'grid' && paginatedSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedSubjects.map((sub) => (
            <div 
              key={sub._id} 
              className="app-card p-5 space-y-4 relative flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-500/20">
                      {sub.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white pt-0.5">
                      {sub.subjectName}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
                      {sub.totalMaxMarks} Marks
                    </span>
                    {sub.streamName && (
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-500/20">
                        {sub.streamName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assessment Components Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Assessment Breakdown:
                  </span>
                  <div className="space-y-1">
                    {sub.components && sub.components.length > 0 ? (
                      sub.components.map((comp, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                        >
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {comp.name} <strong className="text-slate-400 font-mono text-[10px]">({comp.code})</strong>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {comp.maxMarks} <span className="text-[10px] font-normal text-slate-400">(Pass: {comp.passingMarks || 0})</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40">
                        <span className="text-slate-500">Single Component</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sub.totalMaxMarks} Max</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer with Details & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Classes: <strong className="text-slate-900 dark:text-slate-200">{sub.applicableClasses?.join(', ') || 'All'}</strong></span>
                  <div className="mt-1">{renderTypeBadge(sub.subjectType)}</div>
                </div>

                {/* Edit & Delete in Card */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sub)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Edit Subject"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubjectToDelete(sub)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredSubjects.length > 0 && (
        <div className="app-card overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredSubjects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={viewMode === 'table' ? [10, 20, 50] : [6, 9, 18, 36]}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubjects.length === 0 && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No subjects found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm 
              ? `No subjects match "${searchTerm}". Try adjusting your search query.`
              : 'Click "+ New Subject" above to register a subject into the curriculum.'}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {editingSubject ? <Edit className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSubject ? `Edit Subject: ${editingSubject.subjectName}` : 'Register New Subject'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingSubject 
                      ? 'Modify subject title, applicable classes, and evaluation components' 
                      : 'Define curriculum subject, evaluation components, and marks distribution'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSubject(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSubject} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanskrit, Biology, Accountancy"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full app-input text-sm py-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                    Subject Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAN_09, BIO_11"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                    className="w-full app-input text-sm py-2.5 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Subject Type</label>
                  <select
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    className="w-full app-input font-bold py-2.5"
                  >
                    <option value="COMPULSORY">Compulsory Subject</option>
                    <option value="ELECTIVE">Elective Subject</option>
                    <option value="OPTIONAL">Optional Subject</option>
                    <option value="ADDITIONAL">Additional Subject</option>
                    <option value="VOCATIONAL">Vocational Subject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Stream Mapping (Optional)</label>
                  <input
                    type="text"
                    placeholder="Science / Commerce / Arts (or leave blank)"
                    value={formData.streamName}
                    onChange={(e) => setFormData({ ...formData, streamName: e.target.value })}
                    className="w-full app-input py-2.5"
                  />
                </div>
              </div>

              {/* Applicable Classes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-2 font-bold">
                  Applicable Classes <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => {
                    const isSelected = formData.applicableClasses.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleClassSelection(c)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'app-btn-secondary text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>Class {c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Assessment Components Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Assessment Components Breakdown
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configure Theory, Practical, Project, and Internal Assessment weightages
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addComponentRow}
                    className="app-btn-secondary text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Add Component</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.components.map((comp, idx) => (
                    <div
                      key={idx}
                      className="app-card-subtle p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-xs"
                    >
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Component Name
                        </label>
                        <input
                          type="text"
                          required
                          value={comp.name}
                          onChange={(e) => handleComponentChange(idx, 'name', e.target.value)}
                          className="w-full app-input font-bold py-2"
                        />
                      </div>

                      <div className="w-full sm:w-24">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          required
                          value={comp.code}
                          onChange={(e) => handleComponentChange(idx, 'code', e.target.value.toUpperCase())}
                          className="w-full app-input font-mono font-extrabold uppercase text-center py-2"
                        />
                      </div>

                      <div className="w-full sm:w-24">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Max Marks
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={comp.maxMarks}
                          onChange={(e) => handleComponentChange(idx, 'maxMarks', e.target.value)}
                          className="w-full app-input font-black text-center text-sm py-2 text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      <div className="w-full sm:w-24">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Pass Marks
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={comp.passingMarks}
                          onChange={(e) => handleComponentChange(idx, 'passingMarks', e.target.value)}
                          className="w-full app-input font-black text-center text-sm py-2 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>

                      <div className="self-end sm:self-center sm:pt-5">
                        <button
                          type="button"
                          onClick={() => removeComponentRow(idx)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                          title="Remove Component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-Calculated Totals */}
                <div className="app-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                      Total Subject Max: <strong className="text-slate-900 dark:text-white font-black text-sm">{formData.totalMaxMarks} Marks</strong>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                      Passing Criteria: <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{formData.totalPassingMarks} Marks</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Calculates result automatically</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSubject(null);
                  }}
                  className="app-btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50 cursor-pointer"
                >
                  {submitting 
                    ? 'Saving...' 
                    : (editingSubject ? 'Update Subject' : 'Save Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title={
          selectedClass !== 'ALL' && subjectToDelete?.applicableClasses?.length > 1
            ? `Remove from Class ${selectedClass}?`
            : "Delete Subject?"
        }
        message={
          subjectToDelete
            ? (selectedClass !== 'ALL' && subjectToDelete.applicableClasses?.length > 1
                ? `Are you sure you want to remove "${subjectToDelete.subjectName}" (${subjectToDelete.subjectCode}) from Class ${selectedClass}? It will remain active in other classes.`
                : `Are you sure you want to delete "${subjectToDelete.subjectName}" (${subjectToDelete.subjectCode})? This action cannot be undone. Note: Subjects with recorded student marks cannot be deleted.`)
            : ''
        }
        confirmText={
          selectedClass !== 'ALL' && subjectToDelete?.applicableClasses?.length > 1
            ? `Remove from Class ${selectedClass}`
            : "Yes, Delete Subject"
        }
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
