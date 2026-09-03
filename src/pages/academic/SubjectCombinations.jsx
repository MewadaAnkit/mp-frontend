import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { 
  Layers, Plus, Search, Trash2, Edit, CheckCircle2, 
  X, Table, LayoutGrid, Check, BookOpen
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  combinationName: '',
  combinationCode: '',
  className: '11',
  streamName: 'Science',
  compulsorySubjects: [],
  electiveSubjects: [],
  additionalSubjects: [],
  description: ''
};

export default function SubjectCombinations() {
  const [combinations, setCombinations] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStream, setSelectedStream] = useState('ALL');

  // View Mode: 'table' (default) or 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // Modal State for Add & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [comboToDelete, setComboToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [comboRes, subsRes] = await Promise.all([
        api.get('/subjects/combinations'),
        api.get('/subjects')
      ]);

      if (comboRes.data.success) {
        setCombinations(comboRes.data.data);
      }
      if (subsRes.data.success) {
        setAllSubjects(subsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stream combinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter combinations
  const filteredCombinations = useMemo(() => {
    return combinations.filter(combo => {
      // Class filter
      if (selectedClass !== 'ALL' && combo.className !== selectedClass) {
        return false;
      }
      // Stream filter
      if (selectedStream !== 'ALL' && combo.streamName !== selectedStream) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = combo.combinationName && combo.combinationName.toLowerCase().includes(term);
        const matchesCode = combo.combinationCode && combo.combinationCode.toLowerCase().includes(term);
        const matchesStream = combo.streamName && combo.streamName.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesStream) return false;
      }
      return true;
    });
  }, [combinations, selectedClass, selectedStream, searchTerm]);

  // Available subjects for the selected class in the modal
  const availableClassSubjects = useMemo(() => {
    const targetClass = formData.className || '11';
    return allSubjects.filter(s => s.applicableClasses && s.applicableClasses.includes(targetClass));
  }, [allSubjects, formData.className]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCombo(null);
    setFormData({
      ...DEFAULT_FORM,
      className: selectedClass !== 'ALL' ? selectedClass : '11'
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (combo) => {
    setEditingCombo(combo);
    setFormData({
      combinationName: combo.combinationName || '',
      combinationCode: combo.combinationCode || '',
      className: combo.className || '11',
      streamName: combo.streamName || 'Science',
      compulsorySubjects: combo.compulsorySubjects?.map(s => s._id || s) || [],
      electiveSubjects: combo.electiveSubjects?.map(s => s._id || s) || [],
      additionalSubjects: combo.additionalSubjects?.map(s => s._id || s) || [],
      description: combo.description || ''
    });
    setShowModal(true);
  };

  // Toggle Subject in Compulsory list
  const toggleSubjectSelection = (subjectId) => {
    setFormData(prev => {
      const exists = prev.compulsorySubjects.includes(subjectId);
      return {
        ...prev,
        compulsorySubjects: exists
          ? prev.compulsorySubjects.filter(id => id !== subjectId)
          : [...prev.compulsorySubjects, subjectId]
      };
    });
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.combinationName.trim() || !formData.combinationCode.trim()) {
      toast.error('Please enter combination name and code');
      return;
    }
    if (formData.compulsorySubjects.length === 0) {
      toast.error('Please select at least one compulsory subject for this stream');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCombo) {
        const res = await api.put(`/subjects/combinations/${editingCombo._id}`, formData);
        if (res.data.success) {
          toast.success(`Stream track "${formData.combinationName}" updated!`);
          setShowModal(false);
          setEditingCombo(null);
          loadData();
        }
      } else {
        const res = await api.post('/subjects/combinations', formData);
        if (res.data.success) {
          toast.success(`Stream track "${formData.combinationName}" registered!`);
          setShowModal(false);
          loadData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stream track');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!comboToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/subjects/combinations/${comboToDelete._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Stream combination deleted successfully');
        setComboToDelete(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete stream combination');
    } finally {
      setDeleting(false);
    }
  };

  // Helper for stream badge color
  const renderStreamBadge = (stream) => {
    const s = String(stream || '').toLowerCase();
    if (s.includes('science')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/20">
          Science
        </span>
      );
    }
    if (s.includes('commerce')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20">
          Commerce
        </span>
      );
    }
    if (s.includes('art') || s.includes('humanities')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/20">
          Arts / Humanities
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {stream || 'General'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Subject Streams & Combinations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage stream-based elective tracks (Science, Commerce, Arts) for Classes 11 & 12
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#151d30] rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1e293b] text-purple-600 dark:text-purple-400 shadow-xs'
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
                  ? 'bg-white dark:bg-[#1e293b] text-purple-600 dark:text-purple-400 shadow-xs'
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
            <span>New Stream Track</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 app-card p-3 sm:p-4">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search combinations by track name, code, stream..."
            className="w-full app-input !pl-10 !py-2.5 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full app-input !py-2.5 font-bold"
          >
            <option value="ALL">All Classes (11 & 12)</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="w-full app-input !py-2.5 font-bold"
          >
            <option value="ALL">All Streams</option>
            <option value="Science">Science Stream</option>
            <option value="Commerce">Commerce Stream</option>
            <option value="Arts / Humanities">Arts / Humanities</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading subject combinations...</p>
        </div>
      )}

      {/* TABLE VIEW (Default) */}
      {!loading && viewMode === 'table' && filteredCombinations.length > 0 && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-36">Track Code</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Combination Track Name</th>
                  <th className="py-3.5 px-4 w-28">Class</th>
                  <th className="py-3.5 px-4 w-36">Stream</th>
                  <th className="py-3.5 px-4 min-w-[300px]">Compulsory Subjects</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {filteredCombinations.map((combo) => (
                  <tr
                    key={combo._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* Track Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-200/60 dark:border-purple-500/20">
                        {combo.combinationCode}
                      </span>
                    </td>

                    {/* Track Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white text-[13px] block">
                        {combo.combinationName}
                      </span>
                      {combo.description && (
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-normal">
                          {combo.description}
                        </span>
                      )}
                    </td>

                    {/* Class */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black border border-slate-200/60 dark:border-slate-700/60">
                        Class {combo.className}
                      </span>
                    </td>

                    {/* Stream */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStreamBadge(combo.streamName)}
                    </td>

                    {/* Compulsory Subjects */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {combo.compulsorySubjects && combo.compulsorySubjects.length > 0 ? (
                          combo.compulsorySubjects.map((sub, sIdx) => {
                            const name = typeof sub === 'object' ? sub.subjectName : sub;
                            const marks = typeof sub === 'object' ? sub.totalMaxMarks : null;
                            return (
                              <div
                                key={sIdx}
                                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50"
                              >
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                                {marks && (
                                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-[10px]">
                                    ({marks}M)
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-slate-400 text-xs italic">No subjects mapped</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(combo)}
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer"
                          title={`Edit ${combo.combinationName}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setComboToDelete(combo)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title={`Delete ${combo.combinationName}`}
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
      {!loading && viewMode === 'grid' && filteredCombinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCombinations.map((combo) => (
            <div key={combo._id} className="app-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Class {combo.className} Track
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{combo.combinationName}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                      Code: {combo.combinationCode}
                    </span>
                  </div>
                  {renderStreamBadge(combo.streamName)}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                    Compulsory Subjects ({combo.compulsorySubjects?.length || 0}):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {combo.compulsorySubjects?.map((s, idx) => (
                      <div key={idx} className="app-card-subtle px-3 py-2 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-900 dark:text-white">{s.subjectName || s}</span>
                        {s.totalMaxMarks && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{s.totalMaxMarks} M</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Class {combo.className}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(combo)}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Edit Track"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setComboToDelete(combo)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCombinations.length === 0 && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No stream combinations found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm 
              ? `No tracks match "${searchTerm}". Try adjusting your search query.`
              : 'Click "+ New Stream Track" above to create an elective combination track for Class 11 or 12.'}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingCombo ? `Edit Stream Track: ${editingCombo.combinationName}` : 'Create New Stream Track'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define stream combination name, class target, and mapped subjects
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCombo(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                    Combination Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 11 Science (PCM + CS)"
                    value={formData.combinationName}
                    onChange={(e) => setFormData({ ...formData, combinationName: e.target.value })}
                    className="w-full app-input text-sm py-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                    Track Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CLS11_SCI_PCM_CS"
                    value={formData.combinationCode}
                    onChange={(e) => setFormData({ ...formData, combinationCode: e.target.value.toUpperCase() })}
                    className="w-full app-input text-sm py-2.5 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Target Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value, compulsorySubjects: [] })}
                    className="w-full app-input font-bold py-2.5"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Stream Category</label>
                  <select
                    value={formData.streamName}
                    onChange={(e) => setFormData({ ...formData, streamName: e.target.value })}
                    className="w-full app-input font-bold py-2.5"
                  >
                    <option value="Science">Science Stream</option>
                    <option value="Commerce">Commerce Stream</option>
                    <option value="Arts / Humanities">Arts / Humanities</option>
                  </select>
                </div>
              </div>

              {/* Select Compulsory Subjects */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Map Subjects for Class {formData.className} <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Select all compulsory subjects included in this curriculum combination
                    </p>
                  </div>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {formData.compulsorySubjects.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {availableClassSubjects.map(sub => {
                    const isSelected = formData.compulsorySubjects.includes(sub._id);
                    return (
                      <div
                        key={sub._id}
                        onClick={() => toggleSubjectSelection(sub._id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-600/50 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                            {sub.subjectCode}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">
                            {sub.subjectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-500">
                            {sub.totalMaxMarks}M
                          </span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCombo(null);
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
                    : (editingCombo ? 'Update Track' : 'Create Track')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!comboToDelete}
        onClose={() => setComboToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Stream Track?"
        message={
          comboToDelete
            ? `Are you sure you want to delete stream combination "${comboToDelete.combinationName}" (${comboToDelete.combinationCode})? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete Track"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
