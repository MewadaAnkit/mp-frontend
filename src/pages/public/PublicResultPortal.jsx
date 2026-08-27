import React, { useState } from 'react';
import api from '../../api/client';
import { Search, Award, CheckCircle2, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicResultPortal() {
  const [admissionNo, setAdmissionNo] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [className, setClassName] = useState('9');
  const [sessionName, setSessionName] = useState('2025-26');
  const [dob, setDob] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!admissionNo && !rollNo) {
      toast.error('Please enter Admission Number or Roll Number');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      let query = `/public/search?sessionName=${sessionName}&className=${className}`;
      if (admissionNo) query += `&admissionNo=${admissionNo.toUpperCase()}`;
      if (rollNo) query += `&rollNo=${rollNo}`;
      if (dob) query += `&dob=${dob}`;

      const res = await api.get(query);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Result not found or not yet declared');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-canvas p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25 mb-3">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Madhya Pradesh School Examination Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Official Online Result & Marksheet Verification Portal
          </p>
        </div>

        {/* Search Card */}
        <div className="app-card-elevated p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Session</label>
                <select
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full app-input font-bold py-2.5"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Class</label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full app-input font-bold py-2.5"
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map(c => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Admission Number</label>
                <input
                  type="text"
                  placeholder="e.g. MP2025001"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                  className="w-full app-input font-mono font-bold py-2.5 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full app-input font-bold py-2.5"
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary py-3 px-8 text-xs font-bold disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Verifying Records...' : 'Search & View Result'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Result Display Card */}
        {result && (
          <div className="app-card-elevated p-6 sm:p-8 space-y-6 border-2 border-blue-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <span className="app-badge-green font-mono">VERIFIED: {result.verificationCode}</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{result.studentName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Class {result.className} ('{result.sectionName}') • Roll #{result.rollNo} • Adm: {result.admissionNo}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{result.overallPercentage}%</span>
                <span className="block text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">Grade: {result.overallGrade}</span>
              </div>
            </div>

            {/* Subject-Wise Marks Breakdown */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">Marks Obtained</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
                  {result.subjectResults?.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{sub.subjectName}</td>
                      <td className="px-4 py-3 text-center font-black">{sub.totalObtainedMarks}</td>
                      <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-medium">{sub.totalMaxMarks}</td>
                      <td className="px-4 py-3 text-center font-extrabold text-purple-600 dark:text-purple-400">{sub.grade}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={sub.isPassed ? 'app-badge-green' : 'app-badge-red'}>
                          {sub.status || 'PASS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result Summary Banner */}
            <div className="app-card-subtle p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Overall Result:</span>
                <span className="ml-2 font-black text-emerald-600 dark:text-emerald-400 text-sm">{result.resultStatus}</span>
                <span className="ml-3 text-slate-500 dark:text-slate-400 font-semibold">Division: <strong className="text-slate-900 dark:text-white">{result.division}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Official MP School Result Record</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
