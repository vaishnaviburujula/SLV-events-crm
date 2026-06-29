import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Calendar from './pages/Calendar';
import Employees from './pages/Employees';
import Settings from './pages/Settings';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/enquiries"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Enquiries />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Bookings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Customers />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employees"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Layout>
                      <Employees />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
