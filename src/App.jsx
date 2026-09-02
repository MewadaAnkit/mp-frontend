import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboard';

// Admissions & Students
import AdmissionsPipeline from './pages/admissions/AdmissionsPipeline';
import StudentList from './pages/students/StudentList';
import StudentProfile360 from './pages/students/StudentProfile360';
import StudentPromotion from './pages/students/StudentPromotion';

// Staff & Operations
import StaffManagement from './pages/staff/StaffManagement';
import AttendanceRegister from './pages/attendance/AttendanceRegister';
import TimetableSchedule from './pages/timetable/TimetableSchedule';
import HomeworkHub from './pages/homework/HomeworkHub';

// Academic Setup Pages
import AcademicSessions from './pages/academic/AcademicSessions';
import ClassesSections from './pages/academic/ClassesSections';
import SubjectsList from './pages/academic/SubjectsList';
import SubjectCombinations from './pages/academic/SubjectCombinations';

// Finance & Fees
import CollectFeeDesk from './pages/finance/CollectFeeDesk';
import FeeStructures from './pages/finance/FeeStructures';
import TransactionsList from './pages/finance/TransactionsList';

// Examinations & Results (Existing Engine & Exam Schedule)
import SchemeList from './pages/examinations/SchemeList';
import ExaminationList from './pages/examinations/ExaminationList';
import ExamScheduleManager from './pages/examinations/ExamScheduleManager';
import MarksEntryPage from './pages/examinations/MarksEntryPage';
import ResultApprovalWorkflow from './pages/results/ResultApprovalWorkflow';
import PublishedResults from './pages/results/PublishedResults';
import ExternalResultsPage from './pages/external/ExternalResultsPage';

// Communication & Certificates
import NoticeBoard from './pages/communication/NoticeBoard';
import CertificateStudio from './pages/certificates/CertificateStudio';

// Parent & Public Portals
import ParentPortal from './pages/parent/ParentPortal';
import PublicResultPortal from './pages/public/PublicResultPortal';
import PublicVerificationPage from './pages/public/PublicVerificationPage';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import AuditLogsView from './pages/admin/AuditLogsView';
import SchoolSettings from './pages/admin/SchoolSettings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AcademicProvider>
            <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Routes>
                {/* Public Accessible Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/public/search" element={<PublicResultPortal />} />
                <Route path="/result/verify/:code" element={<PublicVerificationPage />} />

                {/* Protected Portal Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AnalyticsDashboard />} />

                  {/* Admissions */}
                  <Route path="admissions" element={<AdmissionsPipeline />} />

                  {/* Students — BUG-023 FIX: promotion route MUST be before /:id wildcard */}
                  <Route path="students" element={<StudentList />} />
                  <Route path="students/promotion" element={<StudentPromotion />} />
                  <Route path="students/:id" element={<StudentProfile360 />} />

                  {/* Staff & Faculty */}
                  <Route path="staff" element={<StaffManagement />} />

                  {/* Daily Operations */}
                  <Route path="attendance" element={<AttendanceRegister />} />
                  <Route path="timetable" element={<TimetableSchedule />} />
                  <Route path="homework" element={<HomeworkHub />} />

                  {/* Academic Setup */}
                  <Route path="academic/sessions" element={<AcademicSessions />} />
                  <Route path="academic/classes" element={<ClassesSections />} />
                  <Route path="academic/subjects" element={<SubjectsList />} />
                  <Route path="academic/combinations" element={<SubjectCombinations />} />

                  {/* Finance & Fees */}
                  <Route path="finance/collect" element={<CollectFeeDesk />} />
                  <Route path="finance/structures" element={<FeeStructures />} />
                  <Route path="finance/transactions" element={<TransactionsList />} />

                  {/* Examinations & Results */}
                  <Route path="examinations/schemes" element={<SchemeList />} />
                  <Route path="examinations" element={<ExaminationList />} />
                  <Route path="examinations/schedule" element={<ExamScheduleManager />} />
                  <Route path="examinations/marks-entry" element={<MarksEntryPage />} />
                  <Route path="results/approval" element={<ResultApprovalWorkflow />} />
                  <Route path="results/published" element={<PublishedResults />} />
                  <Route path="external-results" element={<ExternalResultsPage />} />

                  {/* Communication & Certificates */}
                  <Route path="communication" element={<NoticeBoard />} />
                  <Route path="certificates" element={<CertificateStudio />} />

                  {/* Portals */}
                  <Route path="parent/portal" element={<ParentPortal />} />

                  {/* Admin */}
                  <Route path="admin/users" element={<UserManagement />} />
                  <Route path="admin/audit" element={<AuditLogsView />} />
                  <Route path="admin/settings" element={<SchoolSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AcademicProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
