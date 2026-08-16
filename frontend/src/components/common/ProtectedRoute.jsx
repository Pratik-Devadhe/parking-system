import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  // 1. Check if user is logged in
  if (!user) {
    // Redirect to login page and preserve requested path for seamless redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || role || 'DRIVER').toUpperCase();
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return (
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '36px 30px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-strong)', background: 'var(--bg-card)' }}>
            <div style={{ widthght: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <ShieldAlert size={34} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Your account with role <strong>{userRole}</strong> is not authorized to access this section. This portal requires <strong>{allowedRoles.join(' or ')}</strong> privileges.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <Link 
                to={userRole === 'OWNER' ? '/owner' : '/'}
                className="btn btn-primary"
              >
                <Home size={16} /> Return to Authorized Portal
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
