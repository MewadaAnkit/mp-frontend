import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, Lock, Mail, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen app-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25 mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">MP Board Result Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Madhya Pradesh School Examination & Academic Portal</p>
        </div>

        {/* Login Form Card */}
        <div className="app-card-elevated p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mpschool.edu.in"
                  className="w-full app-input pl-10 py-2.5 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full app-input pl-10 py-2.5 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full app-btn-primary py-3 justify-center text-xs font-bold disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center mb-3">Quick Demo Logins:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('admin@mpschool.edu.in', 'admin123')}
                className="app-card-subtle hover:border-blue-500 p-2.5 rounded-xl text-center transition cursor-pointer"
              >
                <span className="block font-extrabold text-blue-600 dark:text-blue-400">Admin</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('exam@mpschool.edu.in', 'exam123')}
                className="app-card-subtle hover:border-purple-500 p-2.5 rounded-xl text-center transition cursor-pointer"
              >
                <span className="block font-extrabold text-purple-600 dark:text-purple-400">Exam Incharge</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">exam123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('teacher@mpschool.edu.in', 'teacher123')}
                className="app-card-subtle hover:border-emerald-500 p-2.5 rounded-xl text-center transition cursor-pointer"
              >
                <span className="block font-extrabold text-emerald-600 dark:text-emerald-400">Teacher</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">teacher123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('principal@mpschool.edu.in', 'principal123')}
                className="app-card-subtle hover:border-amber-500 p-2.5 rounded-xl text-center transition cursor-pointer"
              >
                <span className="block font-extrabold text-amber-600 dark:text-amber-400">Principal</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">principal123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
