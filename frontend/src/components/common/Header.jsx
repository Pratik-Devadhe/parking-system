import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { 
  Car, 
  MapPin, 
  CalendarCheck, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Repeat,
  Building2,
  Bell,
  Check,
  Globe,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import './Header.css';

function Header() {
  const { user, role, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  const userId = user?.id || 1;
  const currentRole = (user?.role || role || 'DRIVER').toUpperCase();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.') || hostname === 'admin.localhost') {
      setIsAdminSubdomain(true);
    } else {
      setIsAdminSubdomain(false);
    }
  }, []);

  const loadNotifications = async () => {
    if (user) {
      const data = await apiService.getNotifications(userId);
      setNotifications(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user, userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    await apiService.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await apiService.markAllNotificationsRead(userId);
    loadNotifications();
  };

  const handleRoleSelect = (targetRole) => {
    if (currentRole === 'DRIVER' && targetRole !== 'DRIVER') {
      alert('Access Denied: Driver accounts cannot switch to Owner or Admin portal.');
      return;
    }
    if (currentRole === 'OWNER' && targetRole === 'ADMIN') {
      alert('Access Denied: Owner accounts cannot switch to Admin portal.');
      return;
    }

    switchRole(targetRole);
    setShowRoleDropdown(false);
    if (targetRole === 'ADMIN') {
      navigate('/admin');
    } else if (targetRole === 'OWNER') {
      navigate('/owner');
    } else {
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header-container">
      <div className="header-brand-group">
        <Link to={user ? "/" : "/login"} className="header-brand">
          <div className="brand-icon">P</div>
          <div className="brand-text">
            PARK<span className="brand-accent">X</span>
          </div>
        </Link>

        {/* DOMAIN INDICATOR */}
        <div className={`subdomain-tag ${isAdminSubdomain ? 'admin-domain' : 'normal-domain'}`} title="Current Host Domain">
          <Globe size={13} />
          <span>{isAdminSubdomain ? 'admin.localhost' : 'localhost'}</span>
        </div>
      </div>

      <nav className="header-nav">
        {user && (
          <>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <MapPin size={16} />
              <span>Find Parking</span>
            </Link>

            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
              <CalendarCheck size={16} />
              <span>My Bookings</span>
            </Link>

            <Link to="/vehicles" className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`}>
              <Car size={16} />
              <span>My Vehicles</span>
            </Link>

            {/* OWNER PORTAL - Available to OWNER and ADMIN */}
            {(currentRole === 'OWNER' || currentRole === 'ADMIN') && (
              <Link to="/owner" className={`nav-link owner-nav-link ${isActive('/owner') ? 'active' : ''}`}>
                <Building2 size={16} />
                <span>Owner Portal</span>
              </Link>
            )}

            {/* ADMIN PORTAL - ONLY Available to ADMIN */}
            {currentRole === 'ADMIN' && (
              <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <ShieldCheck size={16} />
                <span>Admin Portal</span>
              </Link>
            )}
          </>
        )}
      </nav>

      <div className="header-user-section">
        {/* THEME TOGGLE BUTTON */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
        </button>

        {user ? (
          <>
            {/* ROLE SWITCHER DROPDOWN */}
            <div className="role-switch-wrapper" style={{ position: 'relative' }}>
              <button 
                className="role-switch-btn"
                title="Switch Authorized View"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <Repeat size={14} />
                <span>Role: <strong>{role}</strong></span>
                <ChevronDown size={12} />
              </button>

              {showRoleDropdown && (
                <div className="role-dropdown-menu glass-card">
                  <div className="role-dropdown-header">Switch Role View</div>
                  
                  {/* Driver Mode: Available to all roles */}
                  <button 
                    className={`role-dropdown-item ${role === 'DRIVER' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('DRIVER')}
                  >
                    <Car size={15} /> Driver (Customer)
                  </button>

                  {/* Owner Mode: Available to OWNER and ADMIN */}
                  {(currentRole === 'OWNER' || currentRole === 'ADMIN') && (
                    <button 
                      className={`role-dropdown-item ${role === 'OWNER' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('OWNER')}
                    >
                      <Building2 size={15} /> Space Owner (Host)
                    </button>
                  )}

                  {/* Admin Mode: Available ONLY to ADMIN */}
                  {currentRole === 'ADMIN' && (
                    <button 
                      className={`role-dropdown-item ${role === 'ADMIN' ? 'active' : ''}`}
                      onClick={() => handleRoleSelect('ADMIN')}
                    >
                      <ShieldCheck size={15} /> Platform Admin
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* NOTIFICATION BELL ICON */}
            <div style={{ position: 'relative' }}>
              <button 
                className="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
              </button>

              {/* NOTIFICATION DROPDOWN DRAWER */}
              {showNotifications && (
                <div className="notifications-dropdown glass-card">
                  <div className="notif-header">
                    <span style={{ fontWeight: '800' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.85rem' }}>{n.title}</strong>
                            {!n.is_read && (
                              <button className="read-dot-btn" onClick={() => handleMarkAsRead(n.id)}>
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px', display: 'block' }}>
                            {new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE BADGE */}
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.full_name || 'User'}</span>
                <span className="user-role-label">{currentRole}</span>
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

