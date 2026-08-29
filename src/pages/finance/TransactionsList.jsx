import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  CreditCard,
  Printer,
  Download,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import StatWidget from '../../components/ui/StatWidget';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TransactionsList() {
  const { currentSession } = useAcademic();
  const [receipts, setReceipts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentSession]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, sumRes] = await Promise.all([
        api.get(`/fees/receipts?session=${currentSession?.sessionName || '2025-26'}`),
        api.get(`/fees/summary?session=${currentSession?.sessionName || '2025-26'}`)
      ]);
      if (recRes.data.success) setReceipts(recRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
    } catch (err) {
      toast.error('Failed to load transaction records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.get(
        `/fees/receipts?session=${currentSession?.sessionName || '2025-26'}&search=${encodeURIComponent(search)}`
      );
      if (res.data.success) setReceipts(res.data.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openReceiptModal = (rec) => {
    setSelectedReceipt(rec);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Fee Receipts & Transactions
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Auditable fee transactions ledger, payment mode breakdown, and printable duplicate receipts
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget title="Total Expected Fee" value={`₹${summary?.totalExpected?.toLocaleString('en-IN') || 0}`} subtitle="Class billings" color="blue" />
        <StatWidget title="Total Collected" value={`₹${summary?.totalCollected?.toLocaleString('en-IN') || 0}`} subtitle="Deposited to school" icon={CreditCard} color="emerald" />
        <StatWidget title="Pending Dues" value={`₹${summary?.totalPending?.toLocaleString('en-IN') || 0}`} subtitle="Overdue student dues" color="rose" />
        <StatWidget title="Today's Collection" value={`₹${summary?.todayCollection?.toLocaleString('en-IN') || 0}`} subtitle={`${summary?.todayTransactionsCount || 0} transactions today`} color="amber" />
      </div>

      {/* Search Bar */}
      <div className="app-card p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt by receipt no, student name, admission no..."
              className="app-input pl-10 w-full text-xs font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Receipts Table */}
      <div className="app-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : receipts.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No fee receipts found"
            description="Fee transactions collected at the counter will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131b2e]/60 font-extrabold uppercase text-slate-500 text-[11px]">
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Collected By</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {rec.receiptNo}
                    </td>
                    <td className="py-3.5 px-4">
                      {new Date(rec.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{rec.studentName}</p>
                      <p className="text-[11px] text-slate-500">
                        Adm: {rec.admissionNo} • Class {rec.className}-{rec.sectionName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {rec.paymentMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{rec.amountPaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.collectedByName || 'Accountant'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReceiptModal(rec)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECEIPT VIEW MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Fee Payment Receipt Copy"
        subtitle={`Receipt No: ${selectedReceipt?.receiptNo}`}
      >
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d1322] text-slate-900 dark:text-white space-y-4">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-black text-base tracking-tight text-blue-600 dark:text-blue-400">
                  GOVERNMENT MODEL HIGHER SECONDARY SCHOOL OF EXCELLENCE
                </h2>
                <p className="text-[11px] text-slate-500">Shivaji Nagar, Bhopal, Madhya Pradesh</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">OFFICIAL DUPLICATE RECEIPT</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Receipt No:</p>
                  <p className="font-mono font-bold">{selectedReceipt.receiptNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Date:</p>
                  <p className="font-bold">{new Date(selectedReceipt.paymentDate).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Student Name:</p>
                  <p className="font-bold">{selectedReceipt.studentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Admission No:</p>
                  <p className="font-mono font-bold">{selectedReceipt.admissionNo}</p>
                </div>
                <div>
                  <p className="text-slate-400">Class & Section:</p>
                  <p className="font-bold">Class {selectedReceipt.className} - {selectedReceipt.sectionName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Payment Mode:</p>
                  <p className="font-bold">{selectedReceipt.paymentMode} {selectedReceipt.transactionRef ? `(${selectedReceipt.transactionRef})` : ''}</p>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 dark:border-slate-800 py-2">
                <div className="flex justify-between font-black text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Total Amount Paid:</span>
                  <span>₹{selectedReceipt.amountPaid?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-400">
                <div>
                  <p>Collected By: {selectedReceipt.collectedByName}</p>
                  <p>Computer generated digital receipt.</p>
                </div>
                <div className="text-center">
                  <div className="h-8 border-b border-slate-400 w-28 mx-auto mb-1"></div>
                  <p>Authorized Cashier</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Copy</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
