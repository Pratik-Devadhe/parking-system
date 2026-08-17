import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Car, ShieldCheck, Building2, ArrowRight, Globe } from 'lucide-react';
import './Auth.css';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DRIVER',
    vehicle_number: '',
    vehicle_type: 'FOUR_WHEELER',
    brand: '',
    model: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminDomain, setIsAdminDomain] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.') || hostname === 'admin.localhost') {
      setIsAdminDomain(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.role === 'ADMIN') {
      setError('Registration as ADMIN is not allowed. System Administrator is a restricted single account.');
      return;
    }

    setLoading(true);
    const res = await signup(formData);
    setLoading(false);

    if (res.success) {
      if (formData.role === 'OWNER') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-card auth-card signup-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            P
          </div>
          <h2 className="auth-title">Create PARK-X Account</h2>
          <p className="auth-subtitle">
            Join the smart parking network for Drivers and Parking Owners
          </p>

          <div className="auth-endpoint-notice">
            <Globe size={13} color="var(--primary-teal)" />
            <span>
              {isAdminDomain 
                ? 'Admin Host Domain Active (Admin Registration Restricted)' 
                : 'Standard Host: Driver & Owner Account Registration'}
            </span>
          </div>
        </div>

        {/* 2-Role Selection Switcher */}
        <div className="auth-role-toggle two-roles">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'DRIVER' })}
            className={`auth-role-btn ${formData.role === 'DRIVER' ? 'active' : ''}`}
          >
            <User size={14} /> Driver
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'OWNER' })}
            className={`auth-role-btn ${formData.role === 'OWNER' ? 'active' : ''}`}
          >
            <Building2 size={14} /> Owner
          </button>
        </div>

        {error && (
          <div className="auth-error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form auth-form-signup">
          <div>
            <label className="auth-field-label">
              FULL NAME *
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Alex Mercer"
              className="input-field"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-grid-2">
            <div>
              <label className="auth-field-label">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@domain.com"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="auth-field-label">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 555-0199"
                className="input-field"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="auth-field-label">
              PASSWORD *
            </label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {formData.role === 'DRIVER' && (
            <div className="auth-vehicle-section">
              <div className="auth-vehicle-title">
                <Car size={16} color="var(--primary-teal)" /> Register Primary Vehicle (Optional)
              </div>
              
              <div className="auth-vehicle-grid-2">
                <div>
                  <label className="auth-vehicle-field-label">
                    LICENSE PLATE NUMBER
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    placeholder="e.g. NY-PX-8890"
                    className="input-field"
                    style={{ fontSize: '0.85rem' }}
                    value={formData.vehicle_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="auth-vehicle-field-label">
                    VEHICLE CATEGORY
                  </label>
                  <select
                    name="vehicle_type"
                    className="input-field"
                    style={{ fontSize: '0.85rem' }}
                    value={formData.vehicle_type}
                    onChange={handleChange}
                  >
                    <option value="FOUR_WHEELER">Four-Wheeler (Car/SUV)</option>
                    <option value="TWO_WHEELER">Two-Wheeler (Bike/Scooter)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  name="brand"
                  placeholder="Brand (e.g. Porsche)"
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                  value={formData.brand}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="model"
                  placeholder="Model (e.g. Taycan)"
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {formData.role === 'OWNER' && (
            <div className="auth-vehicle-section">
              <div className="auth-vehicle-title">
                <Building2 size={16} color="var(--primary-teal)" /> Parking Garage Ownership Account
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Owner accounts allow you to list parking locations, manage hourly slots, set approval rules, and monitor real-time earnings.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${formData.role}`}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-footer-link">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
