import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Layers, Award, CheckCircle2, Sliders, ShieldCheck, Plus, Edit2, X, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchemeList() {
  const [schemes, setSchemes] = useState([]);
  const [gradeRules, setGradeRules] = useState([]);
  const [passingRules, setPassingRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGradeRule, setEditingGradeRule] = useState(null);
  const [showPassingModal, setShowPassingModal] = useState(false);
  const [editingPassingRule, setEditingPassingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Scheme form data
  const [schemeForm, setSchemeForm] = useState({
    schemeName: '',
    schemeCode: '',
    calculationMethod: 'SUM_COMPONENTS',
    applicableClasses: ['9'],
    totalMaxMarks: 100,
    description: '',
    components: [
      { name: 'Theory Examination', code: 'TH', defaultMaxMarks: 75, passingMarks: 25, weightage: 100 },
      { name: 'Practical / Project Assessment', code: 'PR', defaultMaxMarks: 25, passingMarks: 8, weightage: 100 }
    ]
  });

  const loadConfig = async () => {
    try {
      const [schRes, grRes, prRes] = await Promise.all([
        api.get('/schemes'),
        api.get('/schemes/grade-rules'),
        api.get('/schemes/passing-rules')
      ]);
      if (schRes.data.success) setSchemes(schRes.data.data);
      if (grRes.data.success) setGradeRules(grRes.data.data);
      if (prRes.data.success) setPassingRules(prRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // --- Scheme Handlers ---
  const handleOpenCreateScheme = () => {
    setEditingSchemeId(null);
    setSchemeForm({
      schemeName: '',
      schemeCode: '',
      calculationMethod: 'SUM_COMPONENTS',
      applicableClasses: ['9'],
      totalMaxMarks: 100,
      description: '',
      components: [
        { name: 'Theory Examination', code: 'TH', defaultMaxMarks: 75, passingMarks: 25, weightage: 100 },
        { name: 'Practical / Project Assessment', code: 'PR', defaultMaxMarks: 25, passingMarks: 8, weightage: 100 }
      ]
    });
    setShowSchemeModal(true);
  };

  const handleOpenEditScheme = (sch) => {
    setEditingSchemeId(sch._id);
    setSchemeForm({
      schemeName: sch.schemeName,
      schemeCode: sch.schemeCode,
      calculationMethod: sch.calculationMethod || 'SUM_COMPONENTS',
      applicableClasses: sch.applicableClasses || ['9'],
      totalMaxMarks: sch.totalMaxMarks || 100,
      description: sch.description || '',
      components: sch.components?.length > 0 ? sch.components.map(c => ({
        name: c.name,
        code: c.code,
        defaultMaxMarks: c.defaultMaxMarks,
        passingMarks: c.passingMarks,
        weightage: c.weightage || 100
      })) : [
        { name: 'Theory Examination', code: 'TH', defaultMaxMarks: 75, passingMarks: 25, weightage: 100 }
      ]
    });
    setShowSchemeModal(true);
  };

  const handleSchemeComponentChange = (index, field, value) => {
    const updated = [...schemeForm.components];
    updated[index][field] = field === 'defaultMaxMarks' || field === 'passingMarks' || field === 'weightage'
      ? (value === '' ? '' : Number(value))
      : value;

    const total = updated.reduce((sum, c) => sum + (Number(c.defaultMaxMarks) || 0), 0);
    setSchemeForm(prev => ({
      ...prev,
      components: updated,
      totalMaxMarks: total || 100
    }));
  };

  const addSchemeComponent = () => {
    const updated = [
      ...schemeForm.components,
      { name: 'Internal Project / Viva', code: 'PR', defaultMaxMarks: 20, passingMarks: 7, weightage: 100 }
    ];
    const total = updated.reduce((sum, c) => sum + (Number(c.defaultMaxMarks) || 0), 0);
    setSchemeForm(prev => ({ ...prev, components: updated, totalMaxMarks: total || 100 }));
  };

  const removeSchemeComponent = (index) => {
    if (schemeForm.components.length === 1) {
      toast.error('Scheme must have at least one component');
      return;
    }
    const updated = schemeForm.components.filter((_, i) => i !== index);
    const total = updated.reduce((sum, c) => sum + (Number(c.defaultMaxMarks) || 0), 0);
    setSchemeForm(prev => ({ ...prev, components: updated, totalMaxMarks: total || 100 }));
  };

  const toggleSchemeClass = (cls) => {
    setSchemeForm(prev => {
      const exists = prev.applicableClasses.includes(cls);
      return {
        ...prev,
        applicableClasses: exists
          ? prev.applicableClasses.filter(c => c !== cls)
          : [...prev.applicableClasses, cls]
      };
    });
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    if (!schemeForm.schemeName || !schemeForm.schemeCode) {
      toast.error('Please enter Scheme Name and Code');
      return;
    }
    setSubmitting(true);
    try {
      if (editingSchemeId) {
        const res = await api.put(`/schemes/${editingSchemeId}`, schemeForm);
        if (res.data.success) {
          toast.success('Examination Scheme updated successfully!');
          setShowSchemeModal(false);
          loadConfig();
        }
      } else {
        const res = await api.post('/schemes', schemeForm);
        if (res.data.success) {
          toast.success('Examination Scheme created successfully!');
          setShowSchemeModal(false);
          loadConfig();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scheme');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Grade Rule Handlers ---
  const handleOpenEditGrade = (rule) => {
    setEditingGradeRule(JSON.parse(JSON.stringify(rule)));
    setShowGradeModal(true);
  };

  const handleGradeBoundaryChange = (index, field, value) => {
    const updated = { ...editingGradeRule };
    updated.boundaries[index][field] = Number(value);
    setEditingGradeRule(updated);
  };

  const handleSaveGradeRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/schemes/grade-rules/${editingGradeRule._id}`, editingGradeRule);
      if (res.data.success) {
        toast.success('Grade Scale boundaries updated!');
        setShowGradeModal(false);
        loadConfig();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update grade rule');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Passing Rule Handlers ---
  const handleOpenEditPassing = (rule) => {
    setEditingPassingRule(JSON.parse(JSON.stringify(rule)));
    setShowPassingModal(true);
  };

  const handleSavePassingRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/schemes/passing-rules/${editingPassingRule._id}`, editingPassingRule);
      if (res.data.success) {
        toast.success('Passing criteria & grace policy updated!');
        setShowPassingModal(false);
        loadConfig();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update passing rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Configurable Examination Scheme Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Database-driven assessment components, weightages, grade boundaries, and passing criteria
          </p>
        </div>

        <button
          onClick={handleOpenCreateScheme}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination Scheme</span>
        </button>
      </div>

      {/* Examination Schemes Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Active Examination Schemes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schemes.map(sch => (
            <div key={sch._id} className="app-card p-6 space-y-4 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {sch.schemeCode} • v{sch.version}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{sch.schemeName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{sch.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-xl">
                    {sch.totalMaxMarks} Marks
                  </span>
                  <button
                    onClick={() => handleOpenEditScheme(sch)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                    title="Configure Scheme"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Components table */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Assessment Components:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {sch.components?.map((comp, idx) => (
                    <div key={idx} className="app-card-subtle p-2.5 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">{comp.name} ({comp.code})</span>
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        <span>Max: <strong className="text-blue-600 dark:text-blue-400">{comp.defaultMaxMarks}</strong></span>
                        <span>Pass: <strong className="text-emerald-600 dark:text-emerald-400">{comp.passingMarks}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                <span>Classes: <strong className="text-slate-900 dark:text-white">{sch.applicableClasses?.join(', ')}</strong></span>
                <span className="app-badge-blue">{sch.calculationMethod}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Rules & Passing Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Rules Card */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>MP Board Grade Scale Engine</span>
            </h2>
            {gradeRules[0] && (
              <button
                onClick={() => handleOpenEditGrade(gradeRules[0])}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Scale</span>
              </button>
            )}
          </div>

          {gradeRules.map(gr => (
            <div key={gr._id} className="app-card-subtle p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{gr.ruleName}</h3>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
                  {gr.ruleCode}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {gr.boundaries?.map((b, idx) => (
                  <div key={idx} className="app-card p-2 rounded-xl text-center">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{b.grade}</span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{b.minPercentage}%+</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Passing Rules Card */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Passing & Grace Marks Engine</span>
            </h2>
            {passingRules[0] && (
              <button
                onClick={() => handleOpenEditPassing(passingRules[0])}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Rules</span>
              </button>
            )}
          </div>

          {passingRules.map(pr => (
            <div key={pr._id} className="app-card-subtle p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">{pr.ruleName}</h3>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                  {pr.ruleCode}
                </span>
              </div>

              <div className="space-y-2 text-slate-700 dark:text-slate-300 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Overall Min Percentage:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{pr.overallMinPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Separate Component Passing:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {pr.requireComponentPassing ? 'Required (Theory + Practical)' : 'Aggregate Only'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Grace Marks Allowed:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Up to {pr.graceMarksPolicy?.maxGraceMarksPerSubject || 0} marks/subject
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Supplementary Allowed:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Up to {pr.supplementaryRules?.maxFailedSubjects || 2} subjects
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL 1: Create / Edit Scheme Modal --- */}
      {showSchemeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingSchemeId ? 'Configure Examination Scheme' : 'Create Examination Scheme'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set up evaluation components, maximum marks, and class applicability
                </p>
              </div>
              <button
                onClick={() => setShowSchemeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP Class 9 Annual Exam Pattern"
                    value={schemeForm.schemeName}
                    onChange={(e) => setSchemeForm({ ...schemeForm, schemeName: e.target.value })}
                    className="w-full app-input text-sm py-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP_CLS9_ANNUAL"
                    value={schemeForm.schemeCode}
                    onChange={(e) => setSchemeForm({ ...schemeForm, schemeCode: e.target.value.toUpperCase() })}
                    className="w-full app-input text-sm py-2.5 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Calculation Method</label>
                  <select
                    value={schemeForm.calculationMethod}
                    onChange={(e) => setSchemeForm({ ...schemeForm, calculationMethod: e.target.value })}
                    className="w-full app-input font-bold py-2.5"
                  >
                    <option value="SUM_COMPONENTS">Direct Sum of Components</option>
                    <option value="WEIGHTED_AVERAGE">Weighted Average %</option>
                    <option value="BEST_OF_5">Best of 5 Subjects Rule</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Evaluation Pattern (75 Theory + 25 Practical)"
                    value={schemeForm.description}
                    onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                    className="w-full app-input py-2.5"
                  />
                </div>
              </div>

              {/* Applicable Classes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-2 font-bold">Applicable Classes *</label>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => {
                    const isSelected = schemeForm.applicableClasses.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleSchemeClass(c)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'app-btn-secondary text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Class {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Components */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-900 dark:text-white">
                    Assessment Breakdown ({schemeForm.totalMaxMarks} Total Marks)
                  </span>
                  <button
                    type="button"
                    onClick={addSchemeComponent}
                    className="app-btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Add Component</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {schemeForm.components.map((comp, idx) => (
                    <div
                      key={idx}
                      className="app-card-subtle p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shadow-sm"
                    >
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Component Name</label>
                        <input
                          type="text"
                          required
                          value={comp.name}
                          onChange={(e) => handleSchemeComponentChange(idx, 'name', e.target.value)}
                          className="w-full app-input font-bold py-2"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Code</label>
                        <input
                          type="text"
                          required
                          value={comp.code}
                          onChange={(e) => handleSchemeComponentChange(idx, 'code', e.target.value.toUpperCase())}
                          className="w-full app-input font-mono font-extrabold uppercase text-center py-2"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Max Marks</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={comp.defaultMaxMarks}
                          onChange={(e) => handleSchemeComponentChange(idx, 'defaultMaxMarks', e.target.value)}
                          className="w-full app-input font-black text-center text-sm py-2 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pass Marks</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={comp.passingMarks}
                          onChange={(e) => handleSchemeComponentChange(idx, 'passingMarks', e.target.value)}
                          className="w-full app-input font-black text-center text-sm py-2 text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div className="self-end sm:self-center sm:pt-5">
                        <button
                          type="button"
                          onClick={() => removeSchemeComponent(idx)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSchemeModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingSchemeId ? 'Update Scheme' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Configure Grade Scale Modal --- */}
      {showGradeModal && editingGradeRule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configure MP Board Grade Scale</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Set percentage boundaries for grades A+ through E</p>
              </div>
              <button
                onClick={() => setShowGradeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGradeRule} className="space-y-4 text-xs">
              <div className="space-y-2.5">
                {editingGradeRule.boundaries?.map((b, idx) => (
                  <div key={idx} className="app-card-subtle p-3 flex items-center justify-between gap-4">
                    <div className="w-16">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{b.grade}</span>
                      <span className="block text-[10px] text-slate-400 font-bold">{b.description || 'Grade'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-slate-500 font-bold text-[11px]">Min %:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={b.minPercentage}
                        onChange={(e) => handleGradeBoundaryChange(idx, 'minPercentage', e.target.value)}
                        className="w-20 app-input font-bold text-center py-1.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-slate-500 font-bold text-[11px]">Max %:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={b.maxPercentage}
                        onChange={(e) => handleGradeBoundaryChange(idx, 'maxPercentage', e.target.value)}
                        className="w-20 app-input font-bold text-center py-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Grade Scale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Configure Passing Rules Modal --- */}
      {showPassingModal && editingPassingRule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configure Passing & Grace Criteria</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Set overall pass percentage, grace marks, and supplementary allowances</p>
              </div>
              <button
                onClick={() => setShowPassingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassingRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Overall Min Percentage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingPassingRule.overallMinPercentage}
                    onChange={(e) => setEditingPassingRule({
                      ...editingPassingRule,
                      overallMinPercentage: Number(e.target.value)
                    })}
                    className="w-full app-input font-bold py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Subject Min Percentage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingPassingRule.subjectMinPercentage}
                    onChange={(e) => setEditingPassingRule({
                      ...editingPassingRule,
                      subjectMinPercentage: Number(e.target.value)
                    })}
                    className="w-full app-input font-bold py-2"
                  />
                </div>
              </div>

              <div className="app-card-subtle p-3.5 space-y-2">
                <label className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPassingRule.requireComponentPassing}
                    onChange={(e) => setEditingPassingRule({
                      ...editingPassingRule,
                      requireComponentPassing: e.target.checked
                    })}
                    className="rounded app-input cursor-pointer"
                  />
                  <span>Require Separate Theory & Practical Passing (MP Board standard)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Max Grace Marks Allowed</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={editingPassingRule.graceMarksPolicy?.maxGraceMarksPerSubject || 0}
                    onChange={(e) => setEditingPassingRule({
                      ...editingPassingRule,
                      graceMarksPolicy: {
                        ...editingPassingRule.graceMarksPolicy,
                        allowGraceMarks: Number(e.target.value) > 0,
                        maxGraceMarksPerSubject: Number(e.target.value)
                      }
                    })}
                    className="w-full app-input font-bold py-2 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Max Supplementary Subjects</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editingPassingRule.supplementaryRules?.maxFailedSubjects || 2}
                    onChange={(e) => setEditingPassingRule({
                      ...editingPassingRule,
                      supplementaryRules: {
                        ...editingPassingRule.supplementaryRules,
                        allowSupplementary: Number(e.target.value) > 0,
                        maxFailedSubjects: Number(e.target.value)
                      }
                    })}
                    className="w-full app-input font-bold py-2 text-purple-600 dark:text-purple-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPassingModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Passing Rules'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
