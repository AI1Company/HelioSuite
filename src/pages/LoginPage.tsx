import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

const LoginPage: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Redirect if already authenticated
  if (currentUser && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading spinner during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderAuthForm = () => {
    switch (authMode) {
      case 'register':
        return <RegisterForm onLogin={() => setAuthMode('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setAuthMode('login')} />;
      default:
        return (
          <LoginForm
            onRegister={() => setAuthMode('register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'register':
        return 'Create your account';
      case 'forgot-password':
        return 'Reset your password';
      default:
        return 'Sign in to your account';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'register':
        return 'Join HelioSuite and start managing your solar business';
      case 'forgot-password':
        return 'Enter your email address and we\'ll send you a link to reset your password';
      default:
        return 'Welcome back! Please sign in to continue';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">HelioSuite</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getSubtitle()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderAuthForm()}
        </div>

        {/* Footer Links */}
        <div className="mt-6">
          <div className="text-center">
            {authMode === 'login' && (
              <>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                  >
                    Sign up here
                  </button>
                </p>
              </>
            )}
            
            {authMode === 'register' && (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  Sign in here
                </button>
              </p>
            )}

            {authMode === 'forgot-password' && (
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Demo Notice */}
        {authMode === 'login' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode Available
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Click "Demo Login" to explore HelioSuite with sample data.
                    No registration required!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 HelioSuite. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-700">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-700">
            Terms of Service
          </Link>
          <Link to="/support" className="text-xs text-gray-500 hover:text-gray-700">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;