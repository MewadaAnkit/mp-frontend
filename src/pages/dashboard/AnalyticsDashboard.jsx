import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Award,
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  School,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  UserPlus,
  BookOpen,
  Receipt,
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import StatWidget from '../../components/ui/StatWidget';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { currentSession, classes, settings } = useAcademic();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  // Role View state
  const [activeRoleView, setActiveRoleView] = useState(user?.role || 'PRINCIPAL');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalPublishedResults: 0,
    pendingApprovalCount: 0
  });

  const [financeSummary, setFinanceSummary] = useState(null);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examAnalytics, setExamAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentSession]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const sessionName = currentSession?.sessionName || '2025-26';

      const [globalRes, examsRes, finRes, inqRes, annRes] = await Promise.all([
        api.get('/analytics'),
        api.get(`/examinations?sessionName=${sessionName}`),
        api.get(`/fees/summary?session=${sessionName}`),
        api.get(`/admissions/inquiries?session=${sessionName}`),
        api.get(`/communication/announcements?session=${sessionName}`)
      ]);

      if (globalRes.data.success) setStats(globalRes.data.data);
      if (finRes.data.success) setFinanceSummary(finRes.data.data);
      if (inqRes.data.success) setInquiriesCount(inqRes.data.count || inqRes.data.data?.length || 0);
      if (annRes.data.success) setAnnouncements(annRes.data.data.slice(0, 3));

      if (examsRes.data.success && examsRes.data.data.length > 0) {
        setExams(examsRes.data.data);
        setSelectedExamId(examsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedExamId) return;
    const loadExamAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/exam/${selectedExamId}`);
        if (res.data.success) {
          setExamAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching exam stats:', err);
      }
    };
    loadExamAnalytics();
  }, [selectedExamId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const schoolTitle = isHindi
    ? settings?.schoolHindiName || 'शासकीय उत्कृष्ट उच्चतर माध्यमिक विद्यालय, भोपाल'
    : settings?.schoolName || 'GOVERNMENT MODEL HIGHER SECONDARY SCHOOL OF EXCELLENCE';

  return (
    <div className="space-y-6">
      {/* Role View Preview Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{schoolTitle}</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {t('common.session', 'Session')}: <strong className="text-blue-600 dark:text-blue-400">{currentSession?.sessionName}</strong> • {isHindi ? 'म.प्र. बोर्ड संबद्धता: MPBSE-SCH-712049' : 'MPBSE Affiliation: MPBSE-SCH-712049'}
          </p>
        </div>

        {/* Role View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2 font-black hidden lg:inline">
            {t('dashboard.roleView', 'Role View')}:
          </span>
          {[
            { id: 'PRINCIPAL', label: t('dashboard.principalView', 'Principal / Admin') },
            { id: 'TEACHER', label: t('dashboard.teacherView', 'Teacher') },
            { id: 'ACCOUNTANT', label: t('dashboard.accountantView', 'Accountant') },
            { id: 'PARENT', label: t('dashboard.parentView', 'Parent') }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoleView(r.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeRoleView === r.id
                  ? 'bg-white dark:bg-[#1e293b] text-blue-600 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: t('dashboard.collectFeeAction', 'Collect Fee'), path: '/finance/collect', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: t('dashboard.markAttendanceAction', 'Mark Attendance'), path: '/attendance', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
          { label: t('dashboard.newAdmissionAction', 'New Admission'), path: '/admissions', icon: UserPlus, color: 'text-cyan-500 bg-cyan-500/10' },
          { label: t('dashboard.enterMarksAction', 'Enter Marks'), path: '/examinations/marks-entry', icon: FileSpreadsheet, color: 'text-purple-500 bg-purple-500/10' },
          { label: t('dashboard.issueCertAction', 'Issue Certificate'), path: '/certificates', icon: Award, color: 'text-rose-500 bg-rose-500/10' },
          { label: t('dashboard.postNoticeAction', 'Post Notice'), path: '/communication', icon: Bell, color: 'text-amber-500 bg-amber-500/10' }
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(act.path)}
              className="app-card p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer group"
            >
              <div className={`p-2.5 rounded-xl ${act.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. PRINCIPAL / MANAGEMENT PERSPECTIVE */}
      {(activeRoleView === 'PRINCIPAL' || activeRoleView === 'ADMIN') && (
        <div className="space-y-6">
          {/* Main KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget
              title={t('dashboard.totalStudents', 'Total Enrollment')}
              value={stats.totalStudents || 3}
              subtitle={isHindi ? 'सत्र में नामांकित विद्यार्थी' : 'Active students in session'}
              icon={Users}
              color="blue"
              onClick={() => navigate('/students')}
            />
            <StatWidget
              title={t('dashboard.todayFee', "Today's Fee Collection")}
              value={`₹${financeSummary?.todayCollection?.toLocaleString('en-IN') || 0}`}
              subtitle={`₹${financeSummary?.totalCollected?.toLocaleString('en-IN') || 0} ${isHindi ? 'कुल जमा' : 'Total YTD'}`}
              icon={CreditCard}
              color="emerald"
              onClick={() => navigate('/finance/transactions')}
            />
            <StatWidget
              title={t('dashboard.activeInquiries', 'Active Inquiries')}
              value={inquiriesCount}
              subtitle={isHindi ? 'प्रवेश पाइपलाइन लीड्स' : 'Admissions pipeline leads'}
              icon={UserPlus}
              color="cyan"
              onClick={() => navigate('/admissions')}
            />
            <StatWidget
              title={t('dashboard.examPipeline', 'Examination Pipeline')}
              value={`${stats.totalPublishedResults || 0} ${isHindi ? 'प्रकाशित' : 'Published'}`}
              subtitle={`${stats.pendingApprovalCount || 0} ${isHindi ? 'लंबित अनुमोदन' : 'pending approvals'}`}
              icon={Award}
              color="purple"
              onClick={() => navigate('/results/approval')}
            />
          </div>

          {/* Middle Row: School Notices & Financial Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notices & Circulars */}
            <div className="lg:col-span-2 app-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>{t('dashboard.circularsTitle', 'Important School Circulars & Alerts')}</span>
                </h3>
                <Link to="/communication" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <span>{t('common.viewAll', 'View All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{ann.title}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(ann.publishDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="app-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>{t('dashboard.financialHealth', 'Financial Health')}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">{t('dashboard.totalCollected', 'Total Collected')}:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    ₹{financeSummary?.totalCollected?.toLocaleString('en-IN') || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex justify-between items-center">
                  <span className="font-bold text-rose-900 dark:text-rose-300">{t('dashboard.outstandingDues', 'Outstanding Dues')}:</span>
                  <span className="font-black text-rose-700 dark:text-rose-400 text-sm">
                    ₹{financeSummary?.totalPending?.toLocaleString('en-IN') || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-300">{t('dashboard.feeConcessions', 'Fee Concessions')}:</span>
                  <span className="font-black text-blue-700 dark:text-blue-400 text-sm">
                    ₹{financeSummary?.totalDiscount?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEACHER / FACULTY PERSPECTIVE */}
      {activeRoleView === 'TEACHER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatWidget
              title={t('dashboard.myAssignedClasses', 'My Assigned Classes')}
              value="Class 9-A, 10-A"
              subtitle={isHindi ? 'गणित संकाय' : 'Mathematics Faculty'}
              icon={School}
              color="blue"
            />
            <StatWidget
              title={t('dashboard.todayAttendanceStatus', "Today's Attendance")}
              value={isHindi ? 'दर्ज' : 'Marked'}
              subtitle={isHindi ? 'कक्षा 9-A पूर्ण' : 'Class 9-A completed'}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatWidget
              title={t('dashboard.activeTasks', 'Active Tasks')}
              value={isHindi ? '2 कार्य' : '2 Tasks'}
              subtitle={isHindi ? 'गृहकार्य असाइनमेंट' : 'Homework assignments'}
              icon={BookOpen}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="app-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {t('dashboard.quickActions', 'Quick Teacher Actions')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/attendance')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{t('dashboard.takeAttendance', 'Take Daily Attendance')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{isHindi ? '1-क्लिक में उपस्थिति दर्ज करें' : 'Mark 1-click attendance'}</p>
                </button>

                <button
                  onClick={() => navigate('/homework')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition"
                >
                  <BookOpen className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{t('dashboard.postHomework', 'Post Class Homework')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{isHindi ? 'दैनिक प्रश्न असाइन करें' : 'Assign daily problems'}</p>
                </button>

                <button
                  onClick={() => navigate('/examinations/marks-entry')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition"
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{t('dashboard.enterExamMarks', 'Enter Exam Marks')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{isHindi ? 'स्प्रेडशीट ग्रिड प्रविष्टि' : 'Spreadsheet grid entry'}</p>
                </button>

                <button
                  onClick={() => navigate('/timetable')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition"
                >
                  <Calendar className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{t('dashboard.mySchedule', 'My Weekly Schedule')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{isHindi ? 'कालखंड समय-सारणी देखें' : 'View period slots'}</p>
                </button>
              </div>
            </div>

            <div className="app-card p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                {isHindi ? 'आज का लेक्चर शेड्यूल' : "Today's Lecture Schedule"}
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-950 dark:text-blue-200">
                      {isHindi ? 'पीरियड 2: गणित (कक्षा 9-A)' : 'Period 2: Mathematics (Class 9-A)'}
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400">09:15 AM - 10:00 AM • Room 101</p>
                  </div>
                  <span className="font-bold text-blue-600">{isHindi ? 'आगामी' : 'Upcoming'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCOUNTANT PERSPECTIVE */}
      {activeRoleView === 'ACCOUNTANT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatWidget title={t('dashboard.todayFee', "Today's Collection")} value={`₹${financeSummary?.todayCollection?.toLocaleString('en-IN') || 0}`} icon={CreditCard} color="emerald" />
            <StatWidget title={isHindi ? 'कुल रसीदें' : 'Total Receipts'} value={financeSummary?.todayTransactionsCount || 1} subtitle={isHindi ? 'आज के लेन-देन' : 'Transactions today'} icon={Receipt} color="blue" />
            <StatWidget title={isHindi ? 'कुल बकाया शुल्क' : 'Total Pending Dues'} value={`₹${financeSummary?.totalPending?.toLocaleString('en-IN') || 0}`} icon={AlertCircle} color="rose" />
            <StatWidget title={isHindi ? 'नामांकित छात्र बिलिंग' : 'Students Billed'} value={financeSummary?.totalLedgersCount || 0} icon={Users} color="purple" />
          </div>

          <div className="app-card p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isHindi ? 'त्वरित शुल्क पटल (Speed Dial)' : 'Fee Counter Speed Dial'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'छात्र खोजें, रसीद काटें एवं प्रिंट निकालें' : 'Collect fee in seconds with live admission search and instant receipt printing'}
              </p>
            </div>
            <button
              onClick={() => navigate('/finance/collect')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
            >
              {isHindi ? 'शुल्क संग्रह पटल खोलें' : 'Open Fast Collection Desk'}
            </button>
          </div>
        </div>
      )}

      {/* 4. PARENT / STUDENT PERSPECTIVE */}
      {activeRoleView === 'PARENT' && (
        <div className="app-card p-6 text-center space-y-4">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">
            {isHindi ? 'अभिभावक एवं विद्यार्थी एकीकृत पोर्टल' : 'Parent & Student Unified Dashboard'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isHindi
              ? 'बच्चों के बीच स्विच करें, दैनिक उपस्थिति जांचें, अंकसूची डाउनलोड करें एवं बकाया शुल्क देखें।'
              : 'Switch between children, check attendance logs, download published marksheets, and inspect pending fee dues.'}
          </p>
          <button
            onClick={() => navigate('/parent/portal')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            {isHindi ? 'अभिभावक पोर्टल खोलें' : 'Open Parent Portal'}
          </button>
        </div>
      )}

      {/* EXAMINATION & RESULTS DEEP ANALYTICS */}
      <div className="app-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>{t('dashboard.examAnalyticsTitle', 'MP Board Examination Engine & Analytics')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHindi ? 'लाइव पास प्रतिशत, श्रेणी वितरण एवं म.प्र. बोर्ड ग्रेडिंग प्रणाली' : 'Live pass percentages, division distributions, and MP grading curves'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="app-select text-xs font-bold min-w-[200px]"
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({isHindi ? 'कक्षा' : 'Class'} {ex.classId?.name || 'All'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {examAnalytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] font-extrabold uppercase text-slate-400">{isHindi ? 'कुल उपस्थित' : 'Total Appeared'}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{examAnalytics.totalAppeared || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <p className="text-[11px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">{isHindi ? 'उत्तीर्ण प्रतिशत' : 'Pass Percentage'}</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{examAnalytics.passPercentage || 0}%</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-center">
              <p className="text-[11px] font-extrabold uppercase text-blue-600 dark:text-blue-400">{isHindi ? 'औसत प्राप्तांक प्रतिशत' : 'Average Percentage'}</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{examAnalytics.averagePercentage || 0}%</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-center">
              <p className="text-[11px] font-extrabold uppercase text-purple-600 dark:text-purple-400">{isHindi ? 'प्रथम श्रेणी (First Div)' : 'First Division'}</p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{examAnalytics.divisions?.FIRST || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            {isHindi ? 'उत्तीर्ण दर एवं श्रेणी वितरण देखने के लिए परीक्षा का चयन करें।' : 'Select an examination to inspect pass rates and division metrics.'}
          </p>
        )}
      </div>
    </div>
  );
}
