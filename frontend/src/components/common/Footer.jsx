import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, MapPin, Radio } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <div className="footer-logo-badge">P</div>
            PARK<span className="footer-brand-sub">X</span>
          </div>
          <p className="footer-text">
            Automated luxury parking management platform. Real-time slot telemetry, instant reservations, and smart gate access control.
          </p>
          <div className="footer-status-pill">
            <Radio size={12} className="animate-pulse" />
            SYSTEM OPERATIONAL &bull; 99.98% UPTIME
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Quick Navigation</h4>
          <ul className="footer-nav-list">
            <li><Link to="/" className="footer-nav-link">All Parking Hubs</Link></li>
            <li><Link to="/bookings" className="footer-nav-link">Active Reservations</Link></li>
            <li><Link to="/vehicles" className="footer-nav-link">Registered Fleet</Link></li>
            <li><Link to="/login" className="footer-nav-link">Authentication Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Admin & Management</h4>
          <ul className="footer-nav-list">
            <li><Link to="/admin" className="footer-nav-link">Owner Dashboard</Link></li>
            <li><Link to="/admin" className="footer-nav-link">Slot Telemetry & Analytics</Link></li>
            <li><Link to="/admin" className="footer-nav-link">Session Barrier Control</Link></li>
            <li><Link to="/users" className="footer-nav-link">User Directory</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Enterprise Security</h4>
          <p className="footer-text">
            Protected by automated PostGIS spatial booking exclusion constraints and encrypted token session auth.
          </p>
          <div className="footer-security-status">
            <ShieldCheck size={16} color="#10b981" /> Verified Safe Entry
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div>&copy; {new Date().getFullYear()} PARK-X Parking Technologies. All rights reserved.</div>
        <div className="footer-legal-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>API Docs</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
