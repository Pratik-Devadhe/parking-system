import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
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
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin.system@parkx.io');
      setPassword('admin123');
      setSelectedRole('ADMIN');
      login('admin.system@parkx.io', 'admin123', 'ADMIN');
      navigate('/admin');
    } else {
      setEmail('alex.driver@parkx.io');
      setPassword('driver123');
      setSelectedRole('DRIVER');
      login('alex.driver@parkx.io', 'driver123', 'DRIVER');
      navigate('/');
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
            Access real-time parking reservations & smart slot telemetry
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="auth-role-toggle">
          <button
            type="button"
            onClick={() => setSelectedRole('DRIVER')}
            className={`auth-role-btn ${selectedRole === 'DRIVER' ? 'active' : ''}`}
          >
            <User size={15} /> Driver Account
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('ADMIN')}
            className={`auth-role-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
          >
            <ShieldCheck size={15} /> Admin Portal
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="auth-quick-demo-box">
          <div className="auth-quick-demo-header">
            <Sparkles size={14} color="#ffffff" /> QUICK DEMO ACCESS:
          </div>
          <div className="auth-quick-demo-btns">
            <button 
              type="button"
              className="btn btn-secondary btn-sm auth-quick-demo-btn"
              onClick={() => handleDemoLogin('DRIVER')}
            >
              Demo Driver
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm auth-quick-demo-btn"
              onClick={() => handleDemoLogin('ADMIN')}
            >
              Demo Admin
            </button>
          </div>
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
