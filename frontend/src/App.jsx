import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import LocationDetail from './pages/LocationDetail';
import BookingsPage from './pages/BookingsPage';
import VehiclesPage from './pages/VehiclesPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <Header />

          <main className="main-content">
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Driver Mode Routes - Accessible to DRIVER, OWNER, ADMIN */}
              <Route path="/" element={
                <ProtectedRoute allowedRoles={['DRIVER', 'OWNER', 'ADMIN']}>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/location/:id" element={
                <ProtectedRoute allowedRoles={['DRIVER', 'OWNER', 'ADMIN']}>
                  <LocationDetail />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute allowedRoles={['DRIVER', 'OWNER', 'ADMIN']}>
                  <BookingsPage />
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute allowedRoles={['DRIVER', 'OWNER', 'ADMIN']}>
                  <VehiclesPage />
                </ProtectedRoute>
              } />

              {/* Protected Owner Mode Routes - Accessible to OWNER and ADMIN */}
              <Route path="/owner" element={
                <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Admin Portal Routes - ONLY Accessible to ADMIN */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              } />

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

