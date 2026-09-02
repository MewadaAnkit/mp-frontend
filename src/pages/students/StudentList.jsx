import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import { Users, Plus, Search, Upload, History, UserCheck, Eye, Sparkles } from 'lucide-react';
import { validateAdmissionNo, validateName, validatePhone, validateSamagraId, validateRollNo, sanitizeText } from '../../utils/validation';
import toast from 'react-hot-toast';

export default function StudentList() {
  const navigate = useNavigate();
  const { currentSession, classes } = useAcademic();
  const { t, isHindi } = useLanguage();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
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
      setLoading(true);
      let url = `/students?sessionName=${currentSession?.sessionName || '2025-26'}`;
      if (selectedClass !== 'ALL') url += `&className=${selectedClass}`;
      if (selectedSection !== 'ALL') url += `&sectionName=${selectedSection}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setStudents(res.data.data);
        setCurrentPage(1);
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

  const validateStudentForm = () => {
    const errs = {};
    const admErr = validateAdmissionNo(formData.admissionNo, true);
    if (admErr) errs.admissionNo = admErr;

    const nameErr = validateName(formData.studentName, 'Student Full Name', true);
    if (nameErr) errs.studentName = nameErr;

    if (formData.fatherName) {
      const fatherErr = validateName(formData.fatherName, "Father's Name", false);
      if (fatherErr) errs.fatherName = fatherErr;
    }

    if (formData.motherName) {
      const motherErr = validateName(formData.motherName, "Mother's Name", false);
      if (motherErr) errs.motherName = motherErr;
    }

    const rollErr = validateRollNo(formData.currentRollNo, true);
    if (rollErr) errs.currentRollNo = rollErr;

    if (formData.samagraId) {
      const samagraErr = validateSamagraId(formData.samagraId, false);
      if (samagraErr) errs.samagraId = samagraErr;
    }

    if (formData.mobileNo) {
      const phoneErr = validatePhone(formData.mobileNo, 'Mobile number', false);
      if (phoneErr) errs.mobileNo = phoneErr;
    }

    return errs;
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const errs = validateStudentForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      toast.error('Please fix the errors in the form before submitting');
      return;
    }
    setFormErrors({});

    try {
      const payload = {
        ...formData,
        admissionNo: formData.admissionNo.trim().toUpperCase(),
        studentName: sanitizeText(formData.studentName),
        fatherName: sanitizeText(formData.fatherName),
        motherName: sanitizeText(formData.motherName),
        samagraId: formData.samagraId.trim(),
        currentStream: sanitizeText(formData.currentStream),
        currentSession: currentSession?.sessionName || '2025-26'
      };
      const res = await api.post('/students', payload);
      if (res.data.success) {
        toast.success(`Student ${formData.studentName} added successfully!`);
        setShowAddModal(false);
        setFormErrors({});
        setFormData({
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
          currentClass: classes[0]?.className || '9',
          currentSection: 'A',
          currentRollNo: '1',
          currentStream: ''
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

  const columns = [
    {
      header: 'Roll / Adm',
      sortable: true,
      sortKey: 'currentRollNo',
      accessor: (st) => (
        <div>
          <span className="font-extrabold text-blue-600 dark:text-blue-400">Roll #{st.currentRollNo}</span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
            Adm: {st.admissionNo}
          </span>
        </div>
      )
    },
    {
      header: 'Student Name',
      sortable: true,
      sortKey: 'studentName',
      accessor: (st) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{st.studentName}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            {st.gender} • {st.category || 'GEN'}
          </span>
        </div>
      )
    },
    {
      header: 'Class & Section',
      sortable: true,
      sortKey: 'currentClass',
      accessor: (st) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Class {st.currentClass} - '{st.currentSection}'
          </span>
          {st.currentStream && (
            <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">
              Stream: {st.currentStream}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Parent Details',
      accessor: (st) => (
        <div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">F: {st.fatherName || '—'}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">M: {st.motherName || '—'}</p>
        </div>
      )
    },
    {
      header: 'Samagra / BSE ID',
      accessor: (st) => (
        <div>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{st.samagraId || '—'}</span>
          {st.mpBseRollNo && (
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              BSE: {st.mpBseRollNo}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (st) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate(`/students/${st._id}`)}
            className="app-btn-primary text-xs py-1.5 px-3"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>360° Profile</span>
          </button>
          <button
            onClick={() => viewStudentHistory(st._id)}
            title="View Academic History"
            className="app-btn-secondary text-xs py-1.5 px-2.5"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('students.title', 'Student Management Directory')}
        subtitle={t('students.subtitle', 'Complete student roster with historical session tracking and 360° academic progression')}
        icon={Users}
        breadcrumbs={[{ label: 'Students' }, { label: 'Directory' }]}
        badge={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            {students.length} Total Students
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="app-btn-secondary text-xs"
            >
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="app-btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        }
      />

      {/* Main Student Data Table */}
      <DataTable
        columns={columns}
        data={paginatedStudents}
        loading={loading}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by Name, Admission No, Samagra ID, Roll No..."
        emptyIcon={Users}
        emptyTitle="No student records found"
        emptyDescription="No students matched your search criteria. Try modifying your filter options or add a new student."
        emptyActionLabel="Register First Student"
        onEmptyAction={() => setShowAddModal(true)}
        filterControls={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="app-input text-xs font-bold min-w-[120px]"
            >
              <option value="ALL">All Classes</option>
              {((classes && classes.length > 0) ? classes : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => ({ _id: c, className: c, displayName: `Class ${c}` }))).map((c) => (
                <option key={c._id || c.className} value={c.className}>
                  {c.displayName || `Class ${c.className}`}
                </option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="app-input text-xs font-bold min-w-[110px]"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
        }
        pagination={{
          page: currentPage,
          totalPages: Math.ceil(students.length / pageSize) || 1,
          totalItems: students.length,
          limit: pageSize,
          onPageChange: setCurrentPage
        }}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Student"
        subtitle="Create an official student record in the active academic session"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Admission Number" required error={formErrors.admissionNo}>
              <input
                type="text"
                placeholder="MP2025001"
                value={formData.admissionNo}
                onChange={(e) => {
                  setFormData({ ...formData, admissionNo: e.target.value.toUpperCase() });
                  if (formErrors.admissionNo) setFormErrors({ ...formErrors, admissionNo: null });
                }}
                className={`w-full app-input font-mono font-bold ${formErrors.admissionNo ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Student Full Name" required error={formErrors.studentName}>
              <input
                type="text"
                placeholder="Full Legal Name"
                value={formData.studentName}
                onChange={(e) => {
                  setFormData({ ...formData, studentName: e.target.value });
                  if (formErrors.studentName) setFormErrors({ ...formErrors, studentName: null });
                }}
                className={`w-full app-input ${formErrors.studentName ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Father's Name" error={formErrors.fatherName}>
              <input
                type="text"
                placeholder="Father's Name"
                value={formData.fatherName}
                onChange={(e) => {
                  setFormData({ ...formData, fatherName: e.target.value });
                  if (formErrors.fatherName) setFormErrors({ ...formErrors, fatherName: null });
                }}
                className={`w-full app-input ${formErrors.fatherName ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Mother's Name" error={formErrors.motherName}>
              <input
                type="text"
                placeholder="Mother's Name"
                value={formData.motherName}
                onChange={(e) => {
                  setFormData({ ...formData, motherName: e.target.value });
                  if (formErrors.motherName) setFormErrors({ ...formErrors, motherName: null });
                }}
                className={`w-full app-input ${formErrors.motherName ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Class" required>
              <select
                value={formData.currentClass}
                onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                className="w-full app-select font-bold"
              >
                {((classes && classes.length > 0) ? classes : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => ({ _id: c, className: c, displayName: `Class ${c}` }))).map((c) => (
                  <option key={c._id || c.className} value={c.className}>
                    {c.displayName || `Class ${c.className}`}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Section" required>
              <select
                value={formData.currentSection}
                onChange={(e) => setFormData({ ...formData, currentSection: e.target.value })}
                className="w-full app-input font-bold"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </FormField>

            <FormField label="Roll Number" required error={formErrors.currentRollNo}>
              <input
                type="number"
                min="1"
                max="9999"
                value={formData.currentRollNo}
                onChange={(e) => {
                  setFormData({ ...formData, currentRollNo: e.target.value });
                  if (formErrors.currentRollNo) setFormErrors({ ...formErrors, currentRollNo: null });
                }}
                className={`w-full app-input font-mono font-bold ${formErrors.currentRollNo ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Samagra ID (MP 9 Digits)" error={formErrors.samagraId}>
              <input
                type="text"
                maxLength={9}
                placeholder="123456789"
                value={formData.samagraId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, samagraId: val });
                  if (formErrors.samagraId) setFormErrors({ ...formErrors, samagraId: null });
                }}
                className={`w-full app-input font-mono ${formErrors.samagraId ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Stream (Class 11/12)">
              <input
                type="text"
                placeholder="Science / Commerce / Arts"
                value={formData.currentStream}
                onChange={(e) => setFormData({ ...formData, currentStream: e.target.value })}
                className="w-full app-input"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="app-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="app-btn-primary text-xs"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Import Students"
        subtitle="Upload an Excel (.xlsx / .xls) file to enroll multiple students at once"
      >
        <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full app-input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400 app-card-subtle p-3.5 rounded-xl">
            <p className="font-bold text-slate-900 dark:text-slate-200 mb-1">Expected Spreadsheet Columns:</p>
            <p className="font-mono">AdmissionNo, StudentName, FatherName, MotherName, Class, Section, RollNo, SamagraId</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="app-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importing}
              className="app-btn-success text-xs"
            >
              {importing ? 'Importing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Progression History Modal */}
      <Modal
        isOpen={!!selectedStudentHistory}
        onClose={() => setSelectedStudentHistory(null)}
        title={selectedStudentHistory?.student?.studentName || 'Student Academic Progression'}
        subtitle={`Admission No: ${selectedStudentHistory?.student?.admissionNo}`}
      >
        {selectedStudentHistory && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
              Permanent Academic Progression History
            </h4>
            <div className="space-y-2">
              {selectedStudentHistory.history?.map((enr) => (
                <div
                  key={enr._id}
                  className="app-card-subtle p-3.5 flex items-center justify-between text-xs rounded-xl"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Session {enr.sessionName}
                    </span>
                    <span className="block text-slate-500 dark:text-slate-400 text-[11px]">
                      Class {enr.className} ('{enr.sectionName}') • Roll #{enr.rollNo}
                    </span>
                    {enr.streamName && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        Stream: {enr.streamName}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={enr.status || 'ACTIVE'} size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

