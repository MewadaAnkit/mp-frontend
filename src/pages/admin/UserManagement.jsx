import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, Plus, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEACHER',
    phone: '',
    designation: ''
  });

  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/users', formData);
      if (res.data.success) {
        toast.success(`User ${formData.name} created!`);
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'TEACHER', phone: '', designation: '' });
        loadUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>User Accounts & Role-Based Access</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage administrator, principal, examination in-charge, and teacher credentials</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="app-btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Staff User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(u => (
          <div key={u._id} className="app-card p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{u.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.designation || 'Staff Member'}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5 font-semibold">{u.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                u.role === 'ADMIN' ? 'app-badge-red' :
                u.role === 'PRINCIPAL' ? 'app-badge-amber' :
                u.role === 'EXAM_INCHARGE' ? 'app-badge-purple' :
                'app-badge-blue'
              }`}>
                {u.role}
              </span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between font-medium">
              <span>Phone: {u.phone || '-'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.isActive ? 'Active Account' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Staff Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@mpschool.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full app-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full app-input font-bold"
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="EXAM_INCHARGE">Exam In-Charge</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. PGT Physics"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full app-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
