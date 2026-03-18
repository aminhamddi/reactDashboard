// dashboard-web/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Audits from './pages/Audits';
import ActionsPage from './pages/ActionsPage';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminGravites from './pages/admin/AdminGravites';
import { getToken, removeToken } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to validate token by calling the auth/me endpoint
        const apiBaseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          removeToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Network error or other issue - clear token to be safe
        console.log('Token validation failed:', error);
        removeToken();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation du compte...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/audits"
          element={isAuthenticated ? <Audits /> : <Navigate to="/login" />}
        />
        <Route
          path="/actions"
          element={isAuthenticated ? <ActionsPage /> : <Navigate to="/login" />}
        />

        {/* Admin routes (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedAdminRoute>
              <AdminQuestions />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedAdminRoute>
              <AdminCategories />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/gravites"
          element={
            <ProtectedAdminRoute>
              <AdminGravites />
            </ProtectedAdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;