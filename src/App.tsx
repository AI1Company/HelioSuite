import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Placeholder routes for future implementation */}
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Clients</h1>
                      <p className="text-gray-600">Client management coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Jobs</h1>
                      <p className="text-gray-600">Job management coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/proposals" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposals</h1>
                      <p className="text-gray-600">Proposal management coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Products</h1>
                      <p className="text-gray-600">Product management coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
                      <p className="text-gray-600">User management coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                      <p className="text-gray-600">Settings coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Static pages */}
            <Route 
              path="/privacy" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-2xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">
                      Your privacy is important to us. This privacy policy explains how HelioSuite 
                      collects, uses, and protects your information.
                    </p>
                    <a href="/login" className="text-blue-600 hover:text-blue-500">
                      Back to Login
                    </a>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/terms" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-2xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-gray-600 mb-6">
                      By using HelioSuite, you agree to these terms of service. Please read them carefully.
                    </p>
                    <a href="/login" className="text-blue-600 hover:text-blue-500">
                      Back to Login
                    </a>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/support" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-2xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Support</h1>
                    <p className="text-gray-600 mb-6">
                      Need help? Contact our support team at support@heliosuite.com or 
                      visit our documentation.
                    </p>
                    <a href="/login" className="text-blue-600 hover:text-blue-500">
                      Back to Login
                    </a>
                  </div>
                </div>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 page */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Page not found</p>
                    <a 
                      href="/dashboard" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;