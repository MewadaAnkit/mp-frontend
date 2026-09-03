import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Phone,
  Mail,
  GraduationCap,
  Layers,
  UserCheck,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import { validateName, validatePhone, validateEmail, sanitizeText } from '../../utils/validation';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const { currentSession, classes, subjects } = useAcademic();
  const [activeTab, setActiveTab] = useState('directory');
  const [staffList, setStaffList] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [staffErrors, setStaffErrors] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [allocPage, setAllocPage] = useState(1);
  const [allocPageSize, setAllocPageSize] = useState(10);

  // Modals
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form states
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'MALE',
    designation: '',
    department: 'ACADEMIC',
    qualification: '',
    experienceYears: 0,
    salary: 0,
    address: ''
  });

  const [allocForm, setAllocForm] = useState({
    teacherId: '',
    className: '9',
    sectionName: 'A',
    subjectCode: '',
    isClassTeacher: false
  });

  useEffect(() => {
    fetchStaff();
    fetchAllocations();
  }, [currentSession]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      let url = '/staff';
      if (departmentFilter) url += `?department=${departmentFilter}`;
      if (search) url += `${departmentFilter ? '&' : '?'}search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await api.get(`/staff/allocations?session=${currentSession?.sessionName || '2025-26'}`);
      if (res.data.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load allocations:', err);
    }
  };

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return staffList.slice(start, start + pageSize);
  }, [staffList, currentPage, pageSize]);

  const paginatedAllocations = useMemo(() => {
    const start = (allocPage - 1) * allocPageSize;
    return allocations.slice(start, start + allocPageSize);
  }, [allocations, allocPage, allocPageSize]);

  const validateStaff = () => {
    const errs = {};
    const nameErr = validateName(staffForm.fullName, 'Full Name', true);
    if (nameErr) errs.fullName = nameErr;

    const phoneErr = validatePhone(staffForm.phone, 'Phone Number', true);
    if (phoneErr) errs.phone = phoneErr;

    if (staffForm.email) {
      const emailErr = validateEmail(staffForm.email, 'Email Address', false);
      if (emailErr) errs.email = emailErr;
    }

    if (!staffForm.designation || !staffForm.designation.trim()) {
      errs.designation = 'Designation is required';
    } else if (staffForm.designation.trim().length < 2) {
      errs.designation = 'Designation must be at least 2 characters';
    }

    if (staffForm.experienceYears < 0 || staffForm.experienceYears > 60) {
      errs.experienceYears = 'Experience must be between 0 and 60 years';
    }

    return errs;
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    const errs = validateStaff();
    if (Object.keys(errs).length > 0) {
      setStaffErrors(errs);
      toast.error('Please fix the errors in the form');
      return;
    }
    setStaffErrors({});

    try {
      const payload = {
        ...staffForm,
        fullName: sanitizeText(staffForm.fullName),
        designation: sanitizeText(staffForm.designation),
        qualification: sanitizeText(staffForm.qualification),
        phone: staffForm.phone.trim().replace(/[\s-+]/g, '')
      };

      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, payload);
        toast.success('Staff details updated');
      } else {
        await api.post('/staff', payload);
        toast.success('New staff member added');
      }
      setStaffModalOpen(false);
      setEditingStaff(null);
      setStaffErrors({});
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to delete staff member');
    }
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    const teacherObj = staffList.find((s) => s._id === allocForm.teacherId);
    const subjectObj = subjects.find((sub) => sub.code === allocForm.subjectCode);

    if (!teacherObj) {
      toast.error('Please select a teacher');
      return;
    }

    try {
      const payload = {
        academicSession: currentSession?.sessionName || '2025-26',
        teacherId: allocForm.teacherId,
        teacherName: teacherObj.fullName,
        className: allocForm.className,
        sectionName: allocForm.sectionName,
        subjectCode: allocForm.subjectCode || 'GEN',
        subjectName: subjectObj ? subjectObj.name : allocForm.subjectCode || 'General Subject',
        isClassTeacher: allocForm.isClassTeacher
      };

      const res = await api.post('/staff/allocations', payload);
      if (res.data.success) {
        toast.success('Teacher allocation saved');
        setAllocModalOpen(false);
        fetchAllocations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save allocation');
    }
  };

  const handleDeleteAllocation = async (id) => {
    try {
      await api.delete(`/staff/allocations/${id}`);
      toast.success('Allocation removed');
      fetchAllocations();
    } catch (err) {
      toast.error('Failed to remove allocation');
    }
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      fullName: staff.fullName,
      phone: staff.phone,
      email: staff.email || '',
      gender: staff.gender || 'MALE',
      designation: staff.designation,
      department: staff.department || 'ACADEMIC',
      qualification: staff.qualification || '',
      experienceYears: staff.experienceYears || 0,
      salary: staff.salary || 0,
      address: staff.address || ''
    });
    setStaffModalOpen(true);
  };

  const academicStaffCount = staffList.filter((s) => s.department === 'ACADEMIC').length;
  const adminStaffCount = staffList.filter((s) => s.department === 'ADMINISTRATION' || s.department === 'ACCOUNTS').length;

  const tabs = [
    { id: 'directory', label: 'Employee & Teacher Directory', icon: Briefcase, badge: staffList.length },
    { id: 'allocations', label: 'Teacher Subject Allocations', icon: Layers, badge: allocations.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Staff & Teacher Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage faculty, administrative employees, and class-subject teacher allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'directory' ? (
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  fullName: '',
                  phone: '',
                  email: '',
                  gender: 'MALE',
                  designation: '',
                  department: 'ACADEMIC',
                  qualification: '',
                  experienceYears: 0,
                  salary: 0,
                  address: ''
                });
                setStaffModalOpen(true);
              }}
              className="app-btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          ) : (
            <button
              onClick={() => setAllocModalOpen(true)}
              className="app-btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Subject to Teacher</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatWidget title="Total Staff" value={staffList.length} subtitle="Active on payroll" icon={Briefcase} color="emerald" />
        <StatWidget title="Teaching Faculty" value={academicStaffCount} subtitle="TGT, PGT & PRT Teachers" icon={GraduationCap} color="blue" />
        <StatWidget title="Subject Allocations" value={allocations.length} subtitle={`Session: ${currentSession?.sessionName || '2025-26'}`} icon={Layers} color="purple" />
      </div>

      {/* Tabs */}
      <div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="app-card overflow-hidden shadow-xs">
          {/* Filter Bar Inside Card */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStaff()}
                placeholder="Search staff by name, emp ID, designation, phone..."
                className="app-input pl-10 w-full text-xs"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setTimeout(fetchStaff, 50);
              }}
              className="app-select text-xs min-w-[160px]"
            >
              <option value="">All Departments</option>
              <option value="ACADEMIC">Academic / Teaching</option>
              <option value="ADMINISTRATION">Administration</option>
              <option value="ACCOUNTS">Accounts & Finance</option>
              <option value="LIBRARY">Library</option>
              <option value="SPORTS">Physical Education</option>
              <option value="SUPPORT">Support Staff</option>
            </select>
          </div>

          <div>
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} cols={5} />
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Briefcase}
                  title="No staff members registered"
                  description="Add teachers and employees to manage assignments and payroll."
                  actionLabel="Add Staff"
                  onAction={() => setStaffModalOpen(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-[#f8fafc] dark:bg-[#141d2f] font-bold uppercase text-slate-400 dark:text-slate-500 text-[11px] tracking-wider">
                      <th className="py-3.5 px-6">Employee ID</th>
                      <th className="py-3.5 px-6">Full Name</th>
                      <th className="py-3.5 px-6">Designation & Dept</th>
                      <th className="py-3.5 px-6">Contact</th>
                      <th className="py-3.5 px-6">Qualification</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-700 dark:text-slate-300">
                    {paginatedStaff.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
                            {st.employeeId}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{st.fullName}</p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{st.gender?.toLowerCase()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{st.designation}</p>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {st.department}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{st.phone}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{st.email || '-'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-700 dark:text-slate-300">{st.qualification || 'Graduate'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{st.experienceYears || 0} yrs exp</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(st)}
                              title="Edit"
                              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(st._id)}
                              title="Delete"
                              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Integrated Pagination Footer */}
          {staffList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={staffList.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: TEACHER ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <div className="app-card overflow-hidden shadow-xs">
          {allocations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Layers}
                title="No subject allocations configured"
                description="Assign teachers to classes, sections, and MP Board subjects."
                actionLabel="Add Teacher Allocation"
                onAction={() => setAllocModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-[#f8fafc] dark:bg-[#141d2f] font-bold uppercase text-slate-400 dark:text-slate-500 text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">Teacher Name</th>
                    <th className="py-3.5 px-6">Class & Section</th>
                    <th className="py-3.5 px-6">Subject Assigned</th>
                    <th className="py-3.5 px-6">Class Teacher Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-700 dark:text-slate-300">
                  {paginatedAllocations.map((al) => (
                    <tr key={al._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-sm">
                        {al.teacherName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs">
                          Class {al.className} - {al.sectionName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{al.subjectName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{al.subjectCode}</p>
                      </td>
                      <td className="py-4 px-6">
                        {al.isClassTeacher ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Class Teacher
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Subject Faculty</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteAlloc(al._id)}
                          title="Remove Allocation"
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Integrated Allocations Pagination Footer */}
          {allocations.length > 0 && (
            <Pagination
              currentPage={allocPage}
              totalItems={allocations.length}
              pageSize={allocPageSize}
              onPageChange={setAllocPage}
              onPageSizeChange={(sz) => {
                setAllocPageSize(sz);
                setAllocPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* MODAL: Add / Edit Staff */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title={editingStaff ? `Edit: ${editingStaff.fullName}` : 'Register Staff Member'}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={staffErrors.fullName}>
              <input
                type="text"
                value={staffForm.fullName}
                onChange={(e) => {
                  setStaffForm({ ...staffForm, fullName: e.target.value });
                  if (staffErrors.fullName) setStaffErrors({ ...staffErrors, fullName: null });
                }}
                placeholder="e.g. Pooja Verma"
                className={`app-input w-full text-xs font-bold ${staffErrors.fullName ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Phone Number" required error={staffErrors.phone}>
              <input
                type="tel"
                maxLength={10}
                value={staffForm.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setStaffForm({ ...staffForm, phone: val });
                  if (staffErrors.phone) setStaffErrors({ ...staffErrors, phone: null });
                }}
                placeholder="10-digit mobile number"
                className={`app-input w-full text-xs ${staffErrors.phone ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Designation" required error={staffErrors.designation}>
              <input
                type="text"
                value={staffForm.designation}
                onChange={(e) => {
                  setStaffForm({ ...staffForm, designation: e.target.value });
                  if (staffErrors.designation) setStaffErrors({ ...staffErrors, designation: null });
                }}
                placeholder="e.g. TGT Mathematics"
                className={`app-input w-full text-xs ${staffErrors.designation ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>

            <FormField label="Department">
              <select
                value={staffForm.department}
                onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                className="app-select w-full text-xs"
              >
                <option value="ACADEMIC">Academic / Faculty</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="ACCOUNTS">Accounts</option>
                <option value="LIBRARY">Library</option>
                <option value="SPORTS">Sports</option>
                <option value="SUPPORT">Support</option>
              </select>
            </FormField>

            <FormField label="Qualification">
              <input
                type="text"
                value={staffForm.qualification}
                onChange={(e) => setStaffForm({ ...staffForm, qualification: e.target.value })}
                placeholder="e.g. M.Sc, B.Ed"
                className="app-input w-full text-xs"
              />
            </FormField>

            <FormField label="Experience (Years)" error={staffErrors.experienceYears}>
              <input
                type="number"
                min="0"
                max="60"
                value={staffForm.experienceYears}
                onChange={(e) => {
                  setStaffForm({ ...staffForm, experienceYears: Number(e.target.value) });
                  if (staffErrors.experienceYears) setStaffErrors({ ...staffErrors, experienceYears: null });
                }}
                className={`app-input w-full text-xs ${staffErrors.experienceYears ? '!border-rose-500 ring-1 !ring-rose-500/30' : ''}`}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="app-btn-primary"
            >
              {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Assign Subject */}
      <Modal
        isOpen={allocModalOpen}
        onClose={() => setAllocModalOpen(false)}
        title="Assign Subject to Teacher"
        subtitle={`Session: ${currentSession?.sessionName || '2025-26'}`}
      >
        <form onSubmit={handleSaveAllocation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Teacher *</label>
            <select
              required
              value={allocForm.teacherId}
              onChange={(e) => setAllocForm({ ...allocForm, teacherId: e.target.value })}
              className="app-select w-full text-xs font-bold"
            >
              <option value="">-- Choose Teacher --</option>
              {staffList
                .filter((s) => s.department === 'ACADEMIC' || s.designation.toLowerCase().includes('teacher'))
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({t.designation})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class *</label>
              <select
                value={allocForm.className}
                onChange={(e) => setAllocForm({ ...allocForm, className: e.target.value })}
                className="app-select w-full text-xs font-bold"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section *</label>
              <select
                value={allocForm.sectionName}
                onChange={(e) => setAllocForm({ ...allocForm, sectionName: e.target.value })}
                className="app-select w-full text-xs uppercase"
              >
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
            <select
              required
              value={allocForm.subjectCode}
              onChange={(e) => setAllocForm({ ...allocForm, subjectCode: e.target.value })}
              className="app-select w-full text-xs font-bold"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((sub) => (
                <option key={sub._id || sub.code} value={sub.code}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="classTeacherCheck"
              checked={allocForm.isClassTeacher}
              onChange={(e) => setAllocForm({ ...allocForm, isClassTeacher: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="classTeacherCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Designate as Class Teacher for this Section
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAllocModalOpen(false)}
              className="app-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="app-btn-primary"
            >
              Assign Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
