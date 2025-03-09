import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#1E4D3A]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#F5F5F2] border-t-[#E86F2C] rounded-full animate-spin mb-4"></div>
      <p className="text-[#F5F5F2] text-sm">Loading app...</p>
    </div>
  </div>
);

// ใช้ React.lazy เพื่อแยกโค้ดและลดขนาด bundle เริ่มต้น
// เฉพาะหน้าแรกๆ ที่อาจจะโหลดทันทีไม่ต้องใช้ lazy
import LandingPage from './components/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

// ใช้ lazy loading สำหรับหน้าอื่นๆ
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ScreenplayEditor = lazy(() => import('./components/ScreenplayEditor'));

// Profile Pages
const ProfileOverview = lazy(() => import('./pages/profile/ProfileOverview'));
const PersonalInfoEditor = lazy(() => import('./pages/profile/PersonalInfoEditor'));
const AccountSettings = lazy(() => import('./pages/profile/AccountSettings'));
const CompanyAffiliations = lazy(() => import('./pages/profile/CompanyAffiliations'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MemberManagement = lazy(() => import('./pages/admin/MemberManagement'));
const MemberInvite = lazy(() => import('./pages/admin/MemberInvite'));
const RoleManagement = lazy(() => import('./pages/admin/RoleManagement'));
const ProjectManagement = lazy(() => import('./pages/admin/ProjectManagement'));

function App() {
  console.log('App component rendering');
  
  return (
    <DarkModeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <SignUp />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signin" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <SignIn />
                  </ProtectedRoute>
                } 
              />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/editor" 
                element={
                  <ProtectedRoute>
                    <ScreenplayEditor isDarkMode={false} zoomLevel={100} />
                  </ProtectedRoute>
                } 
              />

              {/* Profile routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <PersonalInfoEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/account" 
                element={
                  <ProtectedRoute>
                    <AccountSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/companies" 
                element={
                  <ProtectedRoute>
                    <CompanyAffiliations />
                  </ProtectedRoute>
                } 
              />

              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/members" 
                element={
                  <ProtectedRoute>
                    <MemberManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/members/invite" 
                element={
                  <ProtectedRoute>
                    <MemberInvite />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/roles" 
                element={
                  <ProtectedRoute>
                    <RoleManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/projects" 
                element={
                  <ProtectedRoute>
                    <ProjectManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
