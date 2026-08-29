import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { BookOpen, Plus, Layers, Sparkles, Search, Trash2, Edit, CheckCircle2, X, AlertCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function SubjectsList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Add Subject Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  const loadSubjects = async () => {
    try {
      const url = selectedClass === 'ALL' ? '/subjects' : `/subjects?className=${selectedClass}`;
      const res = await api.get(url);
      if (res.data.success) {
        setSubjects(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [selectedClass]);

  // Filtered & Paginated Subjects
  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects;
    const term = searchTerm.toLowerCase();
    return subjects.filter(
      s => s.subjectName.toLowerCase().includes(term) || s.subjectCode.toLowerCase().includes(term)
    );
  }, [subjects, searchTerm]);

  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubjects.slice(start, start + pageSize);
  }, [filteredSubjects, currentPage, pageSize]);

  // Component management in modal
  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = field === 'maxMarks' || field === 'passingMarks' ? (value === '' ? '' : Number(value)) : value;
    
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

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!formData.subjectName || !formData.subjectCode) {
      toast.error('Please enter Subject Name and Code');
      return;
    }
    if (formData.applicableClasses.length === 0) {
      toast.error('Please select at least one applicable class');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/subjects', formData);
      if (res.data.success) {
        toast.success(`Subject "${formData.subjectName}" added successfully!`);
        setShowAddModal(false);
        setFormData({
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
        });
        loadSubjects();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
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
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure subjects, assessment distributions, and stream tracks</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Clean Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-3 sm:p-4">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subjects by name, code..."
            className="w-full app-input !pl-10 !py-2.5 font-medium"
          />
        </div>

        <div>
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

      {/* Clean Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {paginatedSubjects.map((sub) => (
          <div key={sub._id} className="app-card p-5 space-y-4 relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-500/20">
                    {sub.subjectCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white pt-0.5">{sub.subjectName}</h3>
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
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assessment Breakdown:</span>
                <div className="space-y-1">
                  {sub.components && sub.components.length > 0 ? (
                    sub.components.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
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

            {/* Card Footer */}
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 font-medium">
              <span>Classes: <strong className="text-slate-900 dark:text-slate-200">{sub.applicableClasses?.join(', ') || 'All'}</strong></span>
              <span className="app-badge-green font-bold">{sub.subjectType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredSubjects.length > 0 && (
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
            pageSizeOptions={[6, 9, 18, 36]}
          />
        </div>
      )}

      {filteredSubjects.length === 0 && !loading && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No subjects found</p>
          <p className="text-xs text-slate-400">Click "+ New Subject" above to register a subject into the curriculum.</p>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Subject</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Define curriculum subject, evaluation components, and marks distribution</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-6 text-xs">
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
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
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
                    className="app-btn-secondary text-xs"
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
                      Passing Criteria: <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{formData.totalPassingMarks} Marks (33%)</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Calculates result automatically</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
