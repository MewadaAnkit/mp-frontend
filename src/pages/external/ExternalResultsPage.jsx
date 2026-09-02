import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { FileCheck, Upload, Plus, Search, ShieldCheck, ExternalLink, Award } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ExternalResultsPage() {
  const { currentSession } = useAcademic();
  const [selectedClass, setSelectedClass] = useState('5');
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const loadExternalResults = async () => {
    setLoading(true);
    try {
      let url = `/external-results?sessionName=${currentSession?.sessionName || '2025-26'}&className=${selectedClass}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setResults(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExternalResults();
  }, [selectedClass, currentSession, searchTerm]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage, pageSize]);

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please choose a spreadsheet file');
      return;
    }
    setImporting(true);
    const data = new FormData();
    data.append('file', importFile);
    data.append('sessionName', currentSession?.sessionName || '2025-26');
    data.append('className', selectedClass);
    data.append('authorityName', selectedClass === '10' ? 'MP Board of Secondary Education (MPBSE)' : 'Rajya Shiksha Kendra (RSK MP)');

    try {
      const res = await api.post('/external-results/bulk-import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`Imported ${res.data.message}`);
        setShowImportModal(false);
        setImportFile(null);
        loadExternalResults();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Official External / Board Results Reference</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Class 5 & 8 RSK Authority Pattern and Class 10 MPBSE High School Board</p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="app-btn-primary"
        >
          <Upload className="w-4 h-4" />
          <span>Import Board Gazette (Excel)</span>
        </button>
      </div>

      {/* Class Switcher & Notice */}
      <div className="app-card p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: '5', label: 'Class 5th External (RSK)' },
            { id: '8', label: 'Class 8th External (RSK)' },
            { id: '10', label: 'Class 10th MP Board (MPBSE)' },
            { id: '12', label: 'Class 12th Future Ready' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedClass(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedClass === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'app-btn-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Disclaimer Notice */}
        <div className="app-card-subtle p-3.5 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 border border-blue-500/20">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Official Record Notice:</strong> Results displayed here are external state/board declared records. Local school edits are prohibited to guarantee authenticity.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Board Roll No, Student Name, Application No..."
          className="w-full app-input pl-10"
        />
      </div>

      {/* Records Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Board Roll No</th>
                <th className="px-5 py-3.5">Candidate Name</th>
                <th className="px-5 py-3.5">Parents / Center</th>
                <th className="px-5 py-3.5">Total Marks</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">Division</th>
                <th className="px-5 py-3.5 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-200">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {r.boardRollNo}
                      {r.admissionNo && <span className="block text-[10px] text-slate-500 dark:text-slate-400">Adm: {r.admissionNo}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{r.studentName}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{r.authorityName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">F: {r.fatherName || '-'}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Center: {r.centerCode || 'Main'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold">
                      {r.grandTotalObtained} / {r.grandTotalMax}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                      {r.percentage}%
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-purple-600 dark:text-purple-400">
                      {r.division || r.resultStatus}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="app-badge-green">
                        {r.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-400 font-medium">
                    No external results imported yet for Class {selectedClass}. Click 'Import Board Gazette' to upload.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={results.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Class {selectedClass} External Results</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload state authority gazette Excel/CSV with columns: RollNo, StudentName, FatherName, TotalMarks
            </p>

            <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="w-full app-input file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="app-btn-primary disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Upload Gazette'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
