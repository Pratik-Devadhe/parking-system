import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, Building2, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import './Auth.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('DRIVER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email, password, selectedRole);
    setLoading(false);
    if (res.success) {
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.user.role === 'OWNER') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-card auth-card">
        <div className="auth-glow-bg" />

        <div className="auth-header">
          <div className="auth-logo-badge">
            P
          </div>
          <h2 className="auth-title">Sign In to PARK-X</h2>
          <p className="auth-subtitle">
            Smart Parking Management & Real-time Slot Telemetry Platform
          </p>
        </div>

        {/* 3-Role Selection Switcher */}
        <div className="auth-role-toggle 3-roles">
          <button
            type="button"
            onClick={() => setSelectedRole('DRIVER')}
            className={`auth-role-btn ${selectedRole === 'DRIVER' ? 'active' : ''}`}
          >
            <User size={14} /> Driver
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('OWNER')}
            className={`auth-role-btn ${selectedRole === 'OWNER' ? 'active' : ''}`}
          >
            <Building2 size={14} /> Owner
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`auth-role-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
          >
            <ShieldCheck size={14} /> Admin
          </button>
        </div>

        {error && (
          <div className="auth-error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="auth-field-label">
              EMAIL ADDRESS
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                className="input-field auth-input-field-with-icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-field-label">
              PASSWORD
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field auth-password-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In as ${selectedRole}`}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-text">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-footer-link">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
