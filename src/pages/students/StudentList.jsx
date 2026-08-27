import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { Users, Plus, Search, Upload, History, UserCheck, Eye, Sparkles } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function StudentList() {
  const { currentSession, classes } = useAcademic();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    admissionNo: '',
    studentName: '',
    fatherName: '',
    motherName: '',
    samagraId: '',
    mpBseRollNo: '',
    gender: 'MALE',
    dob: '',
    mobileNo: '',
    address: '',
    currentClass: '9',
    currentSection: 'A',
    currentRollNo: '1',
    currentStream: ''
  });

  const loadStudents = async () => {
    try {
      let url = `/students?sessionName=${currentSession?.sessionName || '2025-26'}`;
      if (selectedClass !== 'ALL') url += `&className=${selectedClass}`;
      if (selectedSection !== 'ALL') url += `&sectionName=${selectedSection}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setStudents(res.data.data);
        setCurrentPage(1); // Reset to page 1 on filter/search change
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentSession, selectedClass, selectedSection, searchTerm]);

  // Paginated students slice
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return students.slice(start, start + pageSize);
  }, [students, currentPage, pageSize]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        currentSession: currentSession?.sessionName || '2025-26'
      };
      const res = await api.post('/students', payload);
      if (res.data.success) {
        toast.success(`Student ${formData.studentName} added successfully!`);
        setShowAddModal(false);
        setFormData({
          admissionNo: '', studentName: '', fatherName: '', motherName: '',
          samagraId: '', mpBseRollNo: '', gender: 'MALE', dob: '', mobileNo: '',
          address: '', currentClass: '9', currentSection: 'A', currentRollNo: '1', currentStream: ''
        });
        loadStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please choose a spreadsheet file');
      return;
    }
    setImporting(true);
    const data = new FormData();
    data.append('file', uploadFile);
    data.append('sessionName', currentSession?.sessionName || '2025-26');

    try {
      const res = await api.post('/students/bulk-import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`Successfully imported ${res.data.data.successCount} students!`);
        setShowBulkModal(false);
        setUploadFile(null);
        loadStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const viewStudentHistory = async (studentId) => {
    try {
      const res = await api.get(`/students/${studentId}`);
      if (res.data.success) {
        setSelectedStudentHistory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load student history');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Student Management Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Complete student roster with historical session tracking and progression</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="app-btn-secondary"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bulk Import (Excel/CSV)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="app-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 app-card p-4">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Admission No, Samagra ID, Roll No..."
            className="w-full app-input pl-10"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full app-input font-bold"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c._id} value={c.className}>Class {c.className}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full app-input font-bold"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Student Table Card with Pagination */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Roll / Adm</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Class & Section</th>
                <th className="px-5 py-3.5">Parent Details</th>
                <th className="px-5 py-3.5">Samagra / MP ID</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">Roll #{st.currentRollNo}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">Adm: {st.admissionNo}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{st.studentName}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{st.gender} • {st.category || 'GEN'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Class {st.currentClass} - '{st.currentSection}'</span>
                      {st.currentStream && (
                        <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">Stream: {st.currentStream}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">F: {st.fatherName || '-'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">M: {st.motherName || '-'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{st.samagraId || '-'}</span>
                      {st.mpBseRollNo && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">BSE: {st.mpBseRollNo}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => viewStudentHistory(st._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Progression</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500 dark:text-slate-400 font-medium">
                    No student records found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={students.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Register New Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Admission Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="MP2025001"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value.toUpperCase() })}
                    className="w-full app-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Father's Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Class</label>
                  <select
                    value={formData.currentClass}
                    onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                    className="w-full app-input font-bold"
                  >
                    {classes.map(c => (
                      <option key={c._id} value={c.className}>Class {c.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Section</label>
                  <select
                    value={formData.currentSection}
                    onChange={(e) => setFormData({ ...formData, currentSection: e.target.value })}
                    className="w-full app-input font-bold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.currentRollNo}
                    onChange={(e) => setFormData({ ...formData, currentRollNo: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Samagra ID (MP 9 Digits)</label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={formData.samagraId}
                    onChange={(e) => setFormData({ ...formData, samagraId: e.target.value })}
                    className="w-full app-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Stream (Class 11/12)</label>
                  <input
                    type="text"
                    placeholder="Science / Commerce / Arts"
                    value={formData.currentStream}
                    onChange={(e) => setFormData({ ...formData, currentStream: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
              </div>

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
                  className="app-btn-primary"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Bulk Import Students</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload an Excel (.xlsx/.xls) file with student records</p>
            <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full app-input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 app-card-subtle p-3">
                <p className="font-bold text-slate-900 dark:text-slate-200 mb-1">Expected Spreadsheet Columns:</p>
                <p>AdmissionNo, StudentName, FatherName, MotherName, Class, Section, RollNo, SamagraId</p>
              </div>

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
                  disabled={importing}
                  className="app-btn-success disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Progression History Modal */}
      {selectedStudentHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudentHistory.student.studentName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">Admission No: {selectedStudentHistory.student.admissionNo}</p>
              </div>
              <button
                onClick={() => setSelectedStudentHistory(null)}
                className="text-xs px-2.5 py-1 app-btn-secondary"
              >
                Close
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider mb-2">Permanent Academic Progression History</h4>
              <div className="space-y-2">
                {selectedStudentHistory.history.map((enr) => (
                  <div key={enr._id} className="app-card-subtle p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Session {enr.sessionName}</span>
                      <span className="block text-slate-500 dark:text-slate-400">Class {enr.className} ('{enr.sectionName}') • Roll #{enr.rollNo}</span>
                      {enr.streamName && <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Stream: {enr.streamName}</span>}
                    </div>
                    <span className="app-badge-green">
                      {enr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
