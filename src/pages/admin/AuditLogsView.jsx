import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { ShieldCheck, Search, Clock, UserCheck, AlertCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadLogs = async () => {
    try {
      let url = '/audit?limit=200';
      if (selectedModule !== 'ALL') url += `&module=${selectedModule}`;
      if (searchTerm) url += `&studentAdmissionNo=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedModule, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>System Audit Trail & Mutation Logs</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Searchable immutable log of marks modifications, result publications, and logins</p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 app-card p-4">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by Student Admission Number..."
            className="w-full app-input pl-10"
          />
        </div>

        <div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full app-input font-bold"
          >
            <option value="ALL">All Modules</option>
            <option value="MARKS">Marks Operations</option>
            <option value="RESULTS">Results & Approvals</option>
            <option value="STUDENTS">Student Management</option>
            <option value="AUTH">Authentication / Logins</option>
            <option value="SETTINGS">School Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor User</th>
                <th className="px-5 py-3.5">Action & Module</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Log Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                      {new Date(log.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{log.userName}</p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{log.userRole}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{log.module}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {log.studentAdmissionNo ? (
                        <>
                          <span className="font-bold text-slate-900 dark:text-white">{log.studentName || log.studentAdmissionNo}</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">{log.studentAdmissionNo}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs font-medium">
                      {log.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400 font-medium">
                    No audit log events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={logs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[15, 30, 50, 100]}
        />
      </div>
    </div>
  );
}
