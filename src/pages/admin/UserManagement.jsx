import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { 
  ShieldCheck, Plus, Search, Trash2, Edit, CheckCircle2, 
  X, Table, LayoutGrid, User, Phone, Mail, UserCheck, Lock 
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const DEFAULT_USER_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'TEACHER',
  phone: '',
  designation: '',
  isActive: true
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'table' (default) or 'grid' (cards)
  const [viewMode, setViewMode] = useState('table');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Modal State for Add & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_USER_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Role filter
      if (selectedRole !== 'ALL' && u.role !== selectedRole) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = u.name && u.name.toLowerCase().includes(term);
        const matchesEmail = u.email && u.email.toLowerCase().includes(term);
        const matchesPhone = u.phone && u.phone.toLowerCase().includes(term);
        const matchesDesig = u.designation && u.designation.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesDesig) return false;
      }
      return true;
    });
  }, [users, selectedRole, searchTerm]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(DEFAULT_USER_FORM);
    setShowModal(true);
  };

  // Open Edit
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless updating
      role: user.role || 'TEACHER',
      phone: user.phone || '',
      designation: user.designation || '',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setShowModal(true);
  };

  // Toggle User Active Status directly
  const handleToggleStatus = async (user) => {
    try {
      const res = await api.put(`/auth/users/${user._id}`, {
        isActive: !user.isActive
      });
      if (res.data.success) {
        toast.success(`Account ${!user.isActive ? 'activated' : 'deactivated'} for ${user.name}`);
        loadUsers();
      }
    } catch (err) {
      toast.error('Failed to change user status');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please enter Name and Email');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Password is required for new accounts');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Do not overwrite if empty
        const res = await api.put(`/auth/users/${editingUser._id}`, payload);
        if (res.data.success) {
          toast.success(`User ${formData.name} updated!`);
          setShowModal(false);
          setEditingUser(null);
          loadUsers();
        }
      } else {
        const res = await api.post('/auth/users', formData);
        if (res.data.success) {
          toast.success(`User ${formData.name} created!`);
          setShowModal(false);
          loadUsers();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/auth/users/${userToDelete._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'User account deleted successfully');
        setUserToDelete(null);
        loadUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    } finally {
      setDeleting(false);
    }
  };

  // Role Badge Renderer
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/20">
            Administrator
          </span>
        );
      case 'PRINCIPAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/20">
            Principal
          </span>
        );
      case 'EXAM_INCHARGE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-500/20">
            Exam In-Charge
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-500/20">
            Teacher
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/20">
            Accountant
          </span>
        );
      case 'PARENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200/70 dark:border-cyan-500/20">
            Parent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {role}
          </span>
        );
    }
  };

  // Avatar Initials Helper
  const getInitials = (name) => {
    if (!name) return 'U';
    const cleanName = name.replace(/\(.*?\)/g, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>User Accounts & Role-Based Access</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage administrator, principal, examination in-charge, and teacher credentials
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
                  ? 'bg-white dark:bg-[#1e293b] text-indigo-600 dark:text-indigo-400 shadow-xs'
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
                  ? 'bg-white dark:bg-[#1e293b] text-indigo-600 dark:text-indigo-400 shadow-xs'
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
            <span>New Staff User</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-3 sm:p-4">
        <div className="relative sm:col-span-2 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name, email, designation, phone..."
            className="w-full app-input !pl-10 !py-2.5 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full app-input !py-2.5 font-bold"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="EXAM_INCHARGE">Exam In-Charge</option>
            <option value="TEACHER">Teacher</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="PARENT">Parent</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading user accounts...</p>
        </div>
      )}

      {/* TABLE VIEW (Default) */}
      {!loading && viewMode === 'table' && filteredUsers.length > 0 && (
        <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#131b2e]/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 min-w-[220px]">Staff Member</th>
                  <th className="py-3.5 px-4 w-36">System Role</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Email Address</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Contact Phone</th>
                  <th className="py-3.5 px-4 w-32 text-center">Account Status</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* Member Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-200/60 dark:border-indigo-500/20">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-[13px] block">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {u.designation || 'Staff Member'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderRoleBadge(u.role)}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {u.email}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                      {u.phone || '—'}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          u.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
                        }`}
                        title={u.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
                          title={`Edit ${u.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title={`Delete ${u.name}`}
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
      {!loading && viewMode === 'grid' && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => (
            <div key={u._id} className="app-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-200/60 dark:border-indigo-500/20">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{u.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.designation || 'Staff Member'}</p>
                    </div>
                  </div>
                  {renderRoleBadge(u.role)}
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{u.phone || 'Phone N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(u)}
                  className={`text-xs font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                    u.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-600 hover:text-rose-700'
                  }`}
                >
                  {u.isActive ? '● Active Account' : '● Inactive'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserToDelete(u)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete User"
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
      {!loading && filteredUsers.length === 0 && (
        <div className="app-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No staff user accounts found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm 
              ? `No users match "${searchTerm}". Try adjusting your query.`
              : 'Click "+ New Staff User" above to create an administrator, teacher, or staff account.'}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create Staff User Account'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full app-input font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@mpschool.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full app-input font-mono"
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full app-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full app-input font-bold"
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="EXAM_INCHARGE">Exam In-Charge</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9826012345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full app-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. PGT Physics / Senior Faculty"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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
                  {submitting ? 'Saving...' : (editingUser ? 'Update Account' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete User Account?"
        message={
          userToDelete
            ? `Are you sure you want to permanently delete user account "${userToDelete.name}" (${userToDelete.email})? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
