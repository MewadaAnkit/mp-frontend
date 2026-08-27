import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboard';

// Academic Setup Pages
import AcademicSessions from './pages/academic/AcademicSessions';
import ClassesSections from './pages/academic/ClassesSections';
import SubjectsList from './pages/academic/SubjectsList';
import SubjectCombinations from './pages/academic/SubjectCombinations';

// Student Pages
import StudentList from './pages/students/StudentList';
import StudentPromotion from './pages/students/StudentPromotion';

// Examination Pages
import SchemeList from './pages/examinations/SchemeList';
import ExaminationList from './pages/examinations/ExaminationList';
import MarksEntryPage from './pages/examinations/MarksEntryPage';

// Result Pages
import ResultApprovalWorkflow from './pages/results/ResultApprovalWorkflow';
import PublishedResults from './pages/results/PublishedResults';

// External Authority (Class 5, 8, 10, 12)
import ExternalResultsPage from './pages/external/ExternalResultsPage';

// Public Pages
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

                {/* Academic Setup */}
                <Route path="academic/sessions" element={<AcademicSessions />} />
                <Route path="academic/classes" element={<ClassesSections />} />
                <Route path="academic/subjects" element={<SubjectsList />} />
                <Route path="academic/combinations" element={<SubjectCombinations />} />

                {/* Students */}
                <Route path="students" element={<StudentList />} />
                <Route path="students/promotion" element={<StudentPromotion />} />

                {/* Examinations */}
                <Route path="examinations/schemes" element={<SchemeList />} />
                <Route path="examinations" element={<ExaminationList />} />
                <Route path="examinations/marks-entry" element={<MarksEntryPage />} />

                {/* Results */}
                <Route path="results/approval" element={<ResultApprovalWorkflow />} />
                <Route path="results/published" element={<PublishedResults />} />

                {/* External / Board Authority */}
                <Route path="external-results" element={<ExternalResultsPage />} />

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
    </ThemeProvider>
  );
}
