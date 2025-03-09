import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = false
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log(`ProtectedRoute (${location.pathname}): Auth state -`, {
      isAuthenticated,
      user: user ? `User ID: ${user.id}` : 'No user',
      loading,
      requireAuth,
      requireOnboarding,
      onboardingCompleted: user?.onboardingCompleted
    });
  }, [isAuthenticated, user, loading, location.pathname, requireAuth, requireOnboarding]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E4D3A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5F5F2] border-t-[#E86F2C] rounded-full animate-spin mb-4"></div>
          <p className="text-[#F5F5F2] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    console.log(`ProtectedRoute: Redirecting to signin from ${location.pathname}`);
    
    // Use a hybrid approach for navigation that works better in StackBlitz
    // First, try React Router's Navigate component
    setTimeout(() => {
      // As a fallback, use a form-based navigation approach
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = '/signin';
      document.body.appendChild(form);
      form.submit();
    }, 300);
    
    // Still use React Router's Navigate component as the primary method
    return <Navigate to="/signin" replace />;
  }

  // Check if user has completed onboarding
  if (requireAuth && isAuthenticated && user && !user.onboardingCompleted) {
    // Skip this check for onboarding routes
    const isOnboardingRoute = 
      location.pathname === '/onboarding/personal-info' || 
      location.pathname === '/onboarding/occupation';
    
    if (!isOnboardingRoute) {
      console.log(`ProtectedRoute: Redirecting to onboarding from ${location.pathname}`);
      
      // Use a hybrid approach for navigation that works better in StackBlitz
      // First, try React Router's Navigate component
      setTimeout(() => {
        // As a fallback, use a form-based navigation approach
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = '/onboarding/personal-info';
        document.body.appendChild(form);
        form.submit();
      }, 300);
      
      // Still use React Router's Navigate component as the primary method
      return <Navigate to="/onboarding/personal-info" replace />;
    }
  }

  // For routes that require completed onboarding
  if (requireOnboarding && isAuthenticated && user && !user.onboardingCompleted) {
    console.log(`ProtectedRoute: Redirecting to onboarding from ${location.pathname}`);
    
    // Use a hybrid approach for navigation that works better in StackBlitz
    // First, try React Router's Navigate component
    setTimeout(() => {
      // As a fallback, use a form-based navigation approach
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = '/onboarding/personal-info';
      document.body.appendChild(form);
      form.submit();
    }, 300);
    
    // Still use React Router's Navigate component as the primary method
    return <Navigate to="/onboarding/personal-info" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    console.log(`ProtectedRoute: Redirecting to dashboard from ${location.pathname}`);
    
    // Use a hybrid approach for navigation that works better in StackBlitz
    // First, try React Router's Navigate component
    setTimeout(() => {
      // As a fallback, use a form-based navigation approach
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = '/dashboard';
      document.body.appendChild(form);
      form.submit();
    }, 300);
    
    // Still use React Router's Navigate component as the primary method
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
