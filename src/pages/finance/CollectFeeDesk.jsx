import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Search,
  User,
  CheckCircle2,
  Receipt,
  Printer,
  Sparkles,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function CollectFeeDesk() {
  const { currentSession } = useAcademic();
  const { t, isHindi } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Form states
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [discountReason, setDiscountReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (queryTerm) => {
    const q = queryTerm || searchQuery;
    if (!q || q.trim().length < 2) return;

    try {
      setLoadingSearch(true);
      const res = await api.get(
        `/fees/search-student?query=${encodeURIComponent(q)}&session=${currentSession?.sessionName || '2025-26'}`
      );
      if (res.data.success) {
        setSearchResults(res.data.data);
        if (res.data.data.length === 1) {
          selectStudent(res.data.data[0]);
        }
      }
    } catch (err) {
      toast.error('Student search failed');
    } finally {
      setLoadingSearch(false);
    }
  };

  const selectStudent = (item) => {
    setSelectedStudentData(item);
    setAmountPaid(item.ledger?.balanceAmount > 0 ? String(item.ledger.balanceAmount) : '');
    setDiscountAmount(String(item.ledger?.discountAmount || 0));
    setDiscountReason(item.ledger?.discountReason || '');
    setSearchResults([]);
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentData) {
      toast.error('Please select a student first');
      return;
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId: selectedStudentData.student._id,
        academicSession: currentSession?.sessionName || selectedStudentData.student.currentSession,
        amountPaid: Number(amountPaid),
        paymentMode,
        transactionRef,
        discountAmount: Number(discountAmount) || 0,
        discountReason,
        remarks,
        items: [
          {
            headName: 'School Composite Tuition Fee & Dues',
            amount: Number(amountPaid)
          }
        ]
      };

      const res = await api.post('/fees/collect', payload);
      if (res.data.success) {
        toast.success(`Fee collected! Receipt ${res.data.data.payment.receiptNo}`);
        setIssuedReceipt(res.data.data.payment);
        setReceiptModalOpen(true);

        // Update active selection ledger
        setSelectedStudentData({
          ...selectedStudentData,
          ledger: res.data.data.ledger
        });
        setAmountPaid('');
        setTransactionRef('');
        setRemarks('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment collection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const student = selectedStudentData?.student;
  const ledger = selectedStudentData?.ledger;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('finance.collectDeskTitle', 'Fast Fee Collection Desk')}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('finance.collectDeskSubtitle', 'Search student, view live ledger dues, accept Cash/UPI/Bank payments, and generate official receipts')}
          </p>
        </div>
      </div>

      {/* Student Search Bar */}
      <div className="app-card p-5 relative">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          {t('finance.searchStudent', 'Search Student by Name / Admission No / Mobile / Samagra ID')}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isHindi ? 'प्रवेश क्रमांक (उदा. SCH-2025-001) या नाम दर्ज करें...' : 'Type admission number (e.g. SCH-2025-001) or student name...'}
              className="app-input pl-10 w-full text-xs font-bold"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loadingSearch}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {loadingSearch ? t('common.loading', 'Searching...') : t('finance.findStudentBtn', 'Find Student')}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-5 right-5 top-full mt-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2 space-y-1">
            {searchResults.map((item) => (
              <button
                key={item.student._id}
                onClick={() => selectStudent(item)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-left transition cursor-pointer"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{item.student.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Adm: {item.student.admissionNo} • Class {item.student.currentClass}-{item.student.currentSection} • Roll: {item.student.currentRollNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Dues: ₹{item.ledger?.balanceAmount?.toLocaleString('en-IN') || 0}
                  </p>
                  <Badge variant={item.ledger?.status === 'PAID' ? 'success' : 'warning'} size="xs">
                    {item.ledger?.status || 'PENDING'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student Dues Overview & Collection Form */}
      {selectedStudentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Student Summary Card */}
          <div className="app-card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
                {student.studentName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">{student.studentName}</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Adm: <strong className="font-mono text-blue-600 dark:text-blue-400">{student.admissionNo}</strong>
                </p>
                <p className="text-xs text-slate-500">Class {student.currentClass}-{student.currentSection} • Roll: {student.currentRollNo}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Annual Fee:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{ledger?.totalFee?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Concession / Discount:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">- ₹{ledger?.discountAmount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Net Payable:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{ledger?.netFee?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Paid Till Date:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{ledger?.paidAmount?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">Current Balance Dues:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                  ₹{ledger?.balanceAmount?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>Father: <strong className="text-slate-700 dark:text-slate-300">{student.fatherName || 'N/A'}</strong></p>
              <p>Phone: <strong className="text-slate-700 dark:text-slate-300">{student.mobileNo || 'N/A'}</strong></p>
            </div>
          </div>

          {/* Right Column: Fee Collection Input Box */}
          <div className="lg:col-span-2 app-card p-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" />
              <span>Record Fee Transaction</span>
            </h3>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount to Collect (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount in ₹"
                    className="app-input w-full text-base font-black text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="app-select w-full text-xs font-bold"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash at Counter</option>
                    <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="ONLINE">Online Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction ID / Cheque Ref No
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI Ref / Bank UTR / Cheque #"
                    className="app-input w-full text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fee Discount / Concession (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="app-input w-full text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount / Scholarship Reason (If applicable)
                  </label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="e.g. Sibling discount, Merit scholarship, RTE quota"
                    className="app-input w-full text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Remarks / Receipt Note
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional receipt notes..."
                    className="app-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Processing Payment...' : `Confirm & Collect ₹${amountPaid || '0'}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Fee Payment Receipt"
        subtitle={`Receipt No: ${issuedReceipt?.receiptNo}`}
      >
        {issuedReceipt && (
          <div className="space-y-6">
            {/* Printable Receipt Card */}
            <div id="printable-receipt" className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d1322] text-slate-900 dark:text-white space-y-4">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="font-black text-base tracking-tight text-blue-600 dark:text-blue-400">
                  GOVERNMENT MODEL HIGHER SECONDARY SCHOOL OF EXCELLENCE
                </h2>
                <p className="text-[11px] text-slate-500">Shivaji Nagar, Bhopal, Madhya Pradesh</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">FEE PAYMENT RECEIPT (OFFICIAL COPY)</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Receipt No:</p>
                  <p className="font-mono font-bold">{issuedReceipt.receiptNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Date:</p>
                  <p className="font-bold">{new Date(issuedReceipt.paymentDate).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Student Name:</p>
                  <p className="font-bold">{issuedReceipt.studentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Admission No:</p>
                  <p className="font-mono font-bold">{issuedReceipt.admissionNo}</p>
                </div>
                <div>
                  <p className="text-slate-400">Class & Section:</p>
                  <p className="font-bold">Class {issuedReceipt.className} - {issuedReceipt.sectionName}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Payment Mode:</p>
                  <p className="font-bold">{issuedReceipt.paymentMode} {issuedReceipt.transactionRef ? `(${issuedReceipt.transactionRef})` : ''}</p>
                </div>
              </div>

              {/* Items breakdown */}
              <div className="border-t border-b border-slate-200 dark:border-slate-800 py-2">
                <div className="flex justify-between font-extrabold text-xs">
                  <span>Particulars</span>
                  <span>Amount</span>
                </div>
                {issuedReceipt.items?.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 text-slate-600 dark:text-slate-400">
                    <span>{it.headName}</span>
                    <span>₹{it.amount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                  <span>Total Amount Paid:</span>
                  <span>₹{issuedReceipt.amountPaid?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-400">
                <div>
                  <p>Collected By: {issuedReceipt.collectedByName}</p>
                  <p>This is a computer generated digital fee receipt.</p>
                </div>
                <div className="text-center">
                  <div className="h-8 border-b border-slate-400 w-28 mx-auto mb-1"></div>
                  <p>Authorized Signature</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
