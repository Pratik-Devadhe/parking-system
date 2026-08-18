import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  MapPin, 
  Layers, 
  Activity, 
  DollarSign, 
  Users, 
  Car, 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Sliders,
  Settings,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  ShieldAlert,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, role, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [settings, setSettings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  // Location Form
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_slots: 20,
    operating_hours_start: '06:00:00',
    operating_hours_end: '23:59:59',
    approval_mode: 'AUTO',
    description: ''
  });

  // Slot Form
  const [newSlot, setNewSlot] = useState({
    location_id: '',
    slot_number: '',
    vehicle_type: 'FOUR_WHEELER',
    hourly_price: 12.00,
    daily_price: 65.00,
    status: 'AVAILABLE'
  });

  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [locs, bks, sess, usrList, dispList, setList, statData] = await Promise.all([
        apiService.getLocations(),
        apiService.getAllBookings(),
        apiService.getAllSessions(),
        apiService.getAllUsers(),
        apiService.getAllDisputes(),
        apiService.getSettings(),
        apiService.getAdminStats()
      ]);
      setLocations(locs || []);
      setBookings(bks || []);
      setSessions(sess || []);
      setUsers(usrList || []);
      setDisputes(dispList || []);
      setSettings(setList || []);
      setStats(statData);
    } catch (err) {
      setError('Unable to load admin telemetry. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.address) return;

    await apiService.createLocation(newLocation);
    setShowAddLocationModal(false);
    setNewLocation({
      name: '',
      address: '',
      total_slots: 20,
      operating_hours_start: '06:00:00',
      operating_hours_end: '23:59:59',
      approval_mode: 'AUTO',
      description: ''
    });
    loadAdminData();
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this parking location and all associated slots?')) {
      await apiService.deleteLocation(id);
      loadAdminData();
    }
  };

  const handleVerifyLocation = async (id, currentStatus) => {
    await apiService.verifyLocation(id, !currentStatus);
    loadAdminData();
  };

  const handleVerifyUser = async (id, currentStatus) => {
    await apiService.verifyUser(id, !currentStatus);
    loadAdminData();
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await apiService.updateUserStatus(id, nextStatus);
    loadAdminData();
  };

  const handleUpdateDisputeStatus = async (id, status) => {
    await apiService.updateDisputeStatus(id, status);
    loadAdminData();
  };

  const handleUpdateSetting = async (key, value) => {
    await apiService.updateSetting(key, value);
    loadAdminData();
  };

  // Real-world Portal Gatekeeper check
  if (role !== 'ADMIN') {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', padding: '0 20px' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--primary-gradient)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '20px',
            boxShadow: 'var(--primary-glow)'
          }}>
            <ShieldCheck size={32} />
          </div>

          <span className="badge admin-badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            ADMIN ACCESS GATEWAY
          </span>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>
            Restricted Admin Portal
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
            You are currently browsing in <strong>{role}</strong> mode. Access to executive telemetry, owner verification desks, and platform pricing parameters requires Administrator credentials.
          </p>
        </div>
      </div>
    );
  }

  // KPIs
  const totalRevenue = stats?.total_revenue || bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  const activeSessionsCount = stats?.active_sessions || sessions.filter(s => !s.exit_time).length;
  const openDisputesCount = disputes.filter(d => d.status === 'OPEN').length;

  return (
    <div>
      {/* ADMIN HEADER BANNER */}
      <div className="admin-header-strip">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge admin-badge">
              <ShieldCheck size={14} /> SYSTEM ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="admin-title">Executive Platform Oversight</h1>
          <p className="admin-subtitle">
            Verify parking owners, audit listings, monitor driver disputes & configure platform rules.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadAdminData}>
          <RefreshCw size={16} /> Refresh Telemetry
        </button>
      </div>

      {/* KPI STATS CARDS */}
      <div className="admin-kpi-grid">
        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">TOTAL PLATFORM REVENUE</div>
          <div className="admin-kpi-value">${Number(totalRevenue).toFixed(2)}</div>
          <div className="admin-kpi-trend">Gross Platform Volume</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">ACTIVE GARAGE SESSIONS</div>
          <div className="admin-kpi-value">{activeSessionsCount} Parked</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>Live Barrier Monitoring</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">OPEN USER DISPUTES</div>
          <div className="admin-kpi-value" style={{ color: openDisputesCount > 0 ? 'var(--status-occ-text)' : 'var(--text-main)' }}>
            {openDisputesCount} Tickets
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>Requires Admin Audit</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">MANAGED OWNERS & USERS</div>
          <div className="admin-kpi-value">{users.length} Registered</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>
            {stats?.owner_count || users.filter(u => u.role === 'OWNER').length} Property Owners
          </div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="admin-tabs">
        {[
          { id: 'OVERVIEW', label: 'Overview & Telemetry', icon: Activity },
          { id: 'VERIFICATION', label: 'Owner & Listing Verification', icon: ShieldCheck },
          { id: 'LOCATIONS', label: 'Locations Directory', icon: MapPin },
          { id: 'DISPUTES', label: `Disputes Monitor (${openDisputesCount})`, icon: AlertTriangle },
          { id: 'BOOKINGS', label: 'Master Bookings Audit', icon: CalendarCheck },
          { id: 'SETTINGS', label: 'Pricing Rules & Guidelines', icon: Settings },
          { id: 'USERS', label: 'User Accounts & Roles', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Platform Network Overview & Health</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>FACILITIES & LISTINGS</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)' }}>{locations.length} Locations</div>
                <div style={{ color: 'var(--status-avail-text)', fontSize: '0.8rem', marginTop: '6px', fontWeight: '700' }}>
                  {locations.filter(l => l.is_verified).length} Verified by Admin
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>RESERVATION VOLUME</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)' }}>{bookings.length} Bookings</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                  {bookings.filter(b => b.booking_status === 'COMPLETED').length} Successfully Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OWNER & LISTING VERIFICATION */}
      {activeTab === 'VERIFICATION' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Verify Parking Owners & Listings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Owner Accounts Verification */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Parking Owner Accounts Verification</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.filter(u => u.role === 'OWNER').map(u => (
                  <div key={u.id} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {u.email} &bull; Phone: {u.phone}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge ${u.is_verified ? 'badge-available' : 'badge-pending'}`}>
                        {u.is_verified ? 'VERIFIED OWNER' : 'UNVERIFIED PENDING'}
                      </span>
                      <button
                        className={`btn btn-sm ${u.is_verified ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleVerifyUser(u.id, u.is_verified)}
                      >
                        {u.is_verified ? 'Revoke Verification' : 'Verify Owner Account'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Verification */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Facility Listings Verification</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {locations.map(loc => (
                  <div key={loc.id} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>{loc.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{loc.address} &bull; Owner ID #{loc.owner_id}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge ${loc.is_verified ? 'badge-available' : 'badge-pending'}`}>
                        {loc.is_verified ? 'LISTING APPROVED' : 'NEEDS ADMIN REVIEW'}
                      </span>
                      <button
                        className={`btn btn-sm ${loc.is_verified ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleVerifyLocation(loc.id, loc.is_verified)}
                      >
                        {loc.is_verified ? 'Unapprove Listing' : 'Approve & Verify Listing'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCATIONS DIRECTORY */}
      {activeTab === 'LOCATIONS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Manage Parking Locations</h3>
            <button className="btn btn-primary" onClick={() => setShowAddLocationModal(true)}>
              <Plus size={16} /> Add Parking Hub
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '60px' }}>
            {locations.map(loc => (
              <div key={loc.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{loc.name}</span>
                    <span className="badge badge-dark">ID #{loc.id}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{loc.address} &bull; Capacity: {loc.total_slots} slots</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteLocation(loc.id)}
                  >
                    <Trash2 size={14} /> Delete Hub
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES MONITOR */}
      {activeTab === 'DISPUTES' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Driver & Owner Disputes Support Desk</h3>

          {disputes.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--status-avail-text)', marginBottom: '12px' }} />
              <h4>No support disputes recorded</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {disputes.map(d => (
                <div key={d.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Dispute #{d.id}</span>
                      <span className={`badge ${d.status === 'OPEN' ? 'badge-pending' : d.status === 'RESOLVED' ? 'badge-available' : 'badge-dark'}`}>
                        {d.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '700', marginTop: '6px' }}>
                      Reason: {d.reason}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Booking ID #{d.booking_id} &bull; Driver: {d.user_name || `User #${d.user_id}`} ({d.user_email})
                    </div>
                    {d.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}>
                        "{d.description}"
                      </p>
                    )}
                  </div>

                  {d.status === 'OPEN' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateDisputeStatus(d.id, 'RESOLVED')}>
                        <CheckCircle2 size={14} /> Resolve Ticket
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdateDisputeStatus(d.id, 'REJECTED')}>
                        <XCircle size={14} /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MASTER BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>System Master Bookings Audit</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Booking #{b.id} &bull; Driver ID #{b.user_id}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Slot: {b.slot_number || 'A-01'} | Vehicle: {b.vehicle_number || 'N/A'} | Fee: ${b.total_amount}
                  </div>
                </div>

                <span className={`badge ${b.booking_status === 'CONFIRMED' ? 'badge-available' : 'badge-dark'}`}>
                  {b.booking_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PRICING GUIDELINES & SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Pricing Guidelines & System Parameters</h3>

          <div className="glass-card" style={{ padding: '28px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '18px' }}>Platform Financial Parameters</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {settings.map(s => (
                <div key={s.setting_key} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>{s.setting_key}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.description}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '120px', padding: '6px 12px' }}
                      defaultValue={s.value}
                      onBlur={(e) => handleUpdateSetting(s.setting_key, e.target.value)}
                    />
                    <button className="btn btn-secondary btn-sm">Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>User Accounts & Access Rules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {users.map(u => (
              <div key={u.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{u.full_name}</span>
                  <span className={`badge ${u.status === 'SUSPENDED' ? 'badge-occupied' : 'badge-dark'}`}>{u.role} &bull; {u.status || 'ACTIVE'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email: {u.id}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Id: {u.email}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>Phone: {u.phone || 'N/A'}</div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <button
                    className={`btn btn-sm ${u.status === 'SUSPENDED' ? 'btn-primary' : 'btn-danger'}`}
                    style={{ flex: 1 }}
                    onClick={() => handleToggleUserStatus(u.id, u.status)}
                  >
                    {u.status === 'SUSPENDED' ? 'Re-activate Account' : 'Suspend Access'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {showAddLocationModal && (
        <div className="modal-overlay" onClick={() => setShowAddLocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Create Parking Facility</h3>
            <form onSubmit={handleCreateLocation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  FACILITY NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Central Deck"
                  className="input-field"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  ADDRESS / LOCATION *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100 Main Street, City"
                  className="input-field"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    TOTAL CAPACITY SLOTS
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={newLocation.total_slots}
                    onChange={(e) => setNewLocation({ ...newLocation, total_slots: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    APPROVAL MODE
                  </label>
                  <select
                    className="input-field"
                    value={newLocation.approval_mode}
                    onChange={(e) => setNewLocation({ ...newLocation, approval_mode: e.target.value })}
                  >
                    <option value="AUTO">AUTO (Instant)</option>
                    <option value="MANUAL">MANUAL (Review)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  LOCATION IMAGE (UPLOAD FILE OR PASTE URL)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewLocation({ ...newLocation, image_url: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    className="input-field"
                    value={newLocation.image_url || ''}
                    onChange={(e) => setNewLocation({ ...newLocation, image_url: e.target.value })}
                  />
                  {newLocation.image_url && (
                    <div style={{ marginTop: '4px', textAlign: 'center' }}>
                      <img
                        src={newLocation.image_url}
                        alt="Location Preview"
                        style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Publish Location
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
