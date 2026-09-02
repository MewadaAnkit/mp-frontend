import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  Award,
  Sparkles,
  Download,
  AlertCircle,
  Receipt,
  FileCheck
} from 'lucide-react';
import api from '../../api/client';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

export default function StudentProfile360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}/360`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load student 360 profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">Student record not found.</p>
        <button onClick={() => navigate('/students')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Directory
        </button>
      </div>
    );
  }

  const { student, enrollments, fee, attendance, results, certificates } = data;

  const tabs = [
    { id: 'overview', label: 'Overview & Personal', icon: User },
    { id: 'academics', label: 'Academic History', icon: GraduationCap, badge: enrollments?.length },
    { id: 'fees', label: 'Fee Ledger & Payments', icon: CreditCard, badge: fee?.payments?.length },
    { id: 'attendance', label: 'Attendance Record', icon: CheckCircle2, badge: attendance?.attendanceRate != null ? `${attendance.attendanceRate}%` : 'N/A' },
    { id: 'results', label: 'Exam Results', icon: Award, badge: results?.length },
    { id: 'certificates', label: 'Certificates', icon: FileCheck, badge: certificates?.length }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Directory</span>
      </button>

      {/* Hero Student Banner */}
      <div className="app-card relative overflow-hidden p-6 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border-blue-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-blue-500/20 border-2 border-white dark:border-slate-800 shrink-0">
              {student.studentName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {student.studentName}
                </h1>
                <Badge variant={student.isActive ? 'success' : 'danger'} size="xs" pulse={student.isActive}>
                  {student.isActive ? 'ACTIVE ENROLLMENT' : 'INACTIVE'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Adm: {student.admissionNo}
                </span>
                <span>• Class {student.currentClass} - Section {student.currentSection}</span>
                <span>• Roll No: <strong className="text-slate-900 dark:text-white">{student.currentRollNo}</strong></span>
                {student.samagraId && <span>• Samagra: {student.samagraId}</span>}
                {student.currentStream && (
                  <span className="text-purple-600 dark:text-purple-400">• Stream: {student.currentStream}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate(`/finance/collect?search=${student.admissionNo}`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Fee</span>
            </button>
            <button
              onClick={() => navigate(`/certificates?studentId=${student._id}`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Issue TC / Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT: 1. OVERVIEW & PERSONAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold">Gender</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">{student.gender?.toLowerCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Category</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{student.category || 'GEN'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Date of Birth</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">MP Samagra ID</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{student.samagraId || 'Not Linked'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">MPBSE Board Roll</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{student.mpBseRollNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Admission Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-slate-400 font-semibold text-xs">Residential Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {student.address || 'Address not registered'}
              </p>
            </div>
          </div>

          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Parent & Guardian Contacts</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[11px] font-semibold">Father's Name</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{student.fatherName || 'Not recorded'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-[11px] font-semibold">Mother's Name</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{student.motherName || 'Not recorded'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px] font-semibold">Primary Contact Mobile</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{student.mobileNo || 'N/A'}</p>
                </div>
                {student.mobileNo && (
                  <a
                    href={`tel:${student.mobileNo}`}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. ACADEMIC HISTORY */}
      {activeTab === 'academics' && (
        <div className="app-card p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Academic Progression Timeline</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-slate-500">
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Stream</th>
                  <th className="py-3 px-4">Enrollment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments && enrollments.length > 0 ? (
                  enrollments.map((enr) => (
                    <tr key={enr._id}>
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{enr.sessionName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Class {enr.className}</td>
                      <td className="py-3.5 px-4 font-semibold">{enr.sectionName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{enr.rollNo}</td>
                      <td className="py-3.5 px-4">{enr.streamName || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={enr.status === 'ACTIVE' ? 'success' : 'neutral'} size="xs">
                          {enr.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No historical progression recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. FEE LEDGER & PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Ledger Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatWidget title="Total Annual Fee" value={`₹${fee?.ledger?.totalFee?.toLocaleString('en-IN') || '0'}`} color="blue" />
            <StatWidget title="Discount / Concession" value={`₹${fee?.ledger?.discountAmount?.toLocaleString('en-IN') || '0'}`} subtitle={fee?.ledger?.discountReason || 'No concession'} color="purple" />
            <StatWidget title="Total Paid Amount" value={`₹${fee?.ledger?.paidAmount?.toLocaleString('en-IN') || '0'}`} color="emerald" />
            <StatWidget title="Net Pending Dues" value={`₹${fee?.ledger?.balanceAmount?.toLocaleString('en-IN') || '0'}`} subtitle={`Status: ${fee?.ledger?.status || 'PENDING'}`} color="amber" />
          </div>

          {/* Payment Receipts History */}
          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Payment Transactions & Receipts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-slate-500">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Transaction Ref / Remarks</th>
                    <th className="py-3 px-4">Collected By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fee?.payments && fee.payments.length > 0 ? (
                    fee.payments.map((p) => (
                      <tr key={p._id}>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{p.receiptNo}</td>
                        <td className="py-3.5 px-4">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {p.paymentMode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{p.amountPaid?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{p.transactionRef || p.remarks || '-'}</td>
                        <td className="py-3.5 px-4 font-semibold">{p.collectedByName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No payment receipts logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. ATTENDANCE RECORD */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatWidget title="Attendance Rate" value={attendance?.attendanceRate != null ? `${attendance.attendanceRate}%` : 'N/A'} color="emerald" />
            <StatWidget title="Total Days Tracked" value={attendance?.totalDays || 0} color="blue" />
            <StatWidget title="Days Present" value={attendance?.presentCount || 0} color="teal" />
            <StatWidget title="Days Absent / Leave" value={(attendance?.totalDays || 0) - (attendance?.presentCount || 0)} color="rose" />
          </div>

          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent Daily Attendance Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-extrabold text-slate-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance?.recentRecords && attendance.recentRecords.length > 0 ? (
                    attendance.recentRecords.map((r, i) => (
                      <tr key={i}>
                        <td className="py-3.5 px-4 font-semibold">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={r.status === 'PRESENT' ? 'success' : r.status === 'ABSENT' ? 'danger' : 'warning'} size="xs">
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{r.remarks || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No attendance sessions logged for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. EXAM RESULTS */}
      {activeTab === 'results' && (
        <div className="app-card p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Published MP Board / School Examinations</h3>
          {results && results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((res) => (
                <div key={res._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{res.examinationName || 'Term Examination'}</h4>
                    <Badge variant={res.finalResultStatus === 'PASS' ? 'success' : 'warning'} size="xs">
                      {res.finalResultStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Total Marks</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{res.totalMarksObtained} / {res.totalMaxMarks}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Percentage</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{res.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Division</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{res.division || 'FIRST'}</p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate('/results/published')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> View Printable Marksheet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No published results found for this student.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT: 6. CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Issued School Certificates</h3>
            <button
              onClick={() => navigate(`/certificates?studentId=${student._id}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              Issue Certificate
            </button>
          </div>

          {certificates && certificates.length > 0 ? (
            <div className="space-y-3">
              {certificates.map((c) => (
                <div key={c._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{c.certificateType.replace('_', ' ')}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Cert No: {c.certificateNo} • Issued: {new Date(c.issueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">View / Print</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No certificates issued yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
