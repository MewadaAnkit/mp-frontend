import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { School, Layers, Plus, Users, Award, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClassesSections() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('9');
  const [loading, setLoading] = useState(true);

  // Add Section modal
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('C');
  const [roomNumber, setRoomNumber] = useState('');
  const [classTeacherName, setClassTeacherName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [clsRes, secRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/sections')
      ]);
      if (clsRes.data.success) setClasses(clsRes.data.data);
      if (secRes.data.success) setSections(secRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/academic/sections', {
        className: selectedClass,
        sectionName: newSectionName.toUpperCase(),
        roomNumber,
        classTeacherName
      });
      if (res.data.success) {
        toast.success(`Section ${newSectionName.toUpperCase()} created for Class ${selectedClass}!`);
        setShowAddSectionModal(false);
        setNewSectionName('C');
        setRoomNumber('');
        setClassTeacherName('');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create section');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSections = sections.filter(s => s.className === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Classes & Sections Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage class hierarchy and section allocations</p>
        </div>

        <button
          onClick={() => setShowAddSectionModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section to Class {selectedClass}</span>
        </button>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {classes.map(c => (
          <button
            key={c._id}
            onClick={() => setSelectedClass(c.className)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedClass === c.className
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'app-btn-secondary'
            }`}
          >
            Class {c.className}
          </button>
        ))}
      </div>

      {/* Selected Class Profile Card */}
      {(() => {
        const clsObj = classes.find(c => c.className === selectedClass);
        if (!clsObj) return null;

        return (
          <div className="app-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Class Mode Architecture</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{clsObj.displayName}</h2>
              </div>
              <span className="app-badge-green">
                Mode: {clsObj.classMode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="app-card-subtle p-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Assessment Responsibility</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {clsObj.isExternalBoard ? 'External Authority / State Board Pattern' : 'School Managed Dynamic Scheme'}
                </p>
              </div>
              <div className="app-card-subtle p-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Stream Tracks</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {clsObj.hasStreams ? 'Multi-Stream (Science / Commerce / Arts)' : 'Common Core Foundation'}
                </p>
              </div>
              <div className="app-card-subtle p-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active Sections</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{filteredSections.length} Sections Configured</p>
              </div>
            </div>

            {/* Sections List */}
            <div className="pt-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-3">Configured Sections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredSections.map(sec => (
                  <div key={sec._id} className="app-card-subtle p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-black flex items-center justify-center text-sm">
                        {sec.sectionName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{sec.roomNumber || 'Room N/A'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Class Teacher:</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sec.classTeacherName || sec.classTeacher?.name || 'Assigned Class Teacher'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Section to Class {selectedClass}</h2>
            <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C, D, E"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
                  className="w-full app-input uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Assigned Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 204"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full app-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Class Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sunita Verma"
                  value={classTeacherName}
                  onChange={(e) => setClassTeacherName(e.target.value)}
                  className="w-full app-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
