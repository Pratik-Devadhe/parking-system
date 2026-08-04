import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  MapPin, 
  CalendarCheck, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Activity, 
  Repeat,
  User
} from 'lucide-react';
import './Header.css';

function Header() {
  const { user, role, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-container">
      <Link to="/" className="header-brand">
        <div className="brand-icon">P</div>
        <div className="brand-text">
          PARK<span className="brand-accent">X</span>
        </div>
      </Link>

      <nav className="header-nav">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <MapPin size={16} />
          Locations
        </Link>

        {user && (
          <>
            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
              <CalendarCheck size={16} />
              My Bookings
            </Link>

            <Link to="/vehicles" className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`}>
              <Car size={16} />
              My Vehicles
            </Link>
          </>
        )}

        {role === 'ADMIN' && (
          <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
            <ShieldCheck size={16} />
            Admin Portal
          </Link>
        )}
      </nav>

      <div className="header-user-section">
        {user ? (
          <>
            <button 
              className="btn btn-secondary btn-sm"
              title="Toggle role space for testing"
              onClick={() => switchRole(role === 'ADMIN' ? 'DRIVER' : 'ADMIN')}
            >
              <Repeat size={14} />
              {role === 'ADMIN' ? 'Driver View' : 'Admin Space'}
            </button>

            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.full_name || 'Driver'}</span>
                <span className="user-role-label">{role}</span>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">
              <LogIn size={16} />
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <UserPlus size={16} />
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
