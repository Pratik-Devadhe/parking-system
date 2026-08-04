import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
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
  Settings
} from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [locations, setLocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedLocationForSlot, setSelectedLocationForSlot] = useState(null);

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

  const loadAdminData = async () => {
    setLoading(true);
    const [locs, bks, sess, usrList] = await Promise.all([
      apiService.getLocations(),
      apiService.getAllBookings(),
      apiService.getAllSessions(),
      apiService.getAllUsers()
    ]);
    setLocations(locs);
    setBookings(bks);
    setSessions(sess);
    setUsers(usrList);
    setLoading(false);
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

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.slot_number || !newSlot.location_id) return;

    await apiService.createSlot(newSlot);
    setShowAddSlotModal(false);
    loadAdminData();
  };

  const handleSlotStatusToggle = async (slotId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    await apiService.updateSlotStatus(slotId, nextStatus);
    loadAdminData();
  };

  // KPIs
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  const activeSessionsCount = sessions.filter(s => !s.exit_time).length;
  const totalSlotsCount = locations.reduce((sum, l) => sum + (Number(l.total_slots) || 0), 0);

  return (
    <div>
      {/* ADMIN HEADER BANNER */}
      <div className="admin-header-strip">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge admin-badge">
              <ShieldCheck size={14} /> ADMIN & OWNER CONTROL CENTER
            </span>
          </div>
          <h1 className="admin-title">Facility Management Portal</h1>
          <p className="admin-subtitle">
            Real-time barrier telemetry, slot pricing configurations, and user analytics
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadAdminData}>
          <RefreshCw size={16} /> Sync Telemetry
        </button>
      </div>

      {/* KPI STATS CARDS */}
      <div className="admin-kpi-grid">
        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">TOTAL REVENUE GENERATED</div>
          <div className="admin-kpi-value">${totalRevenue.toFixed(2)}</div>
          <div className="admin-kpi-trend">+18.4% from last week</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">ACTIVE GATE SESSIONS</div>
          <div className="admin-kpi-value">{activeSessionsCount} Vehicles Parked</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>Live Barrier Monitoring</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">TOTAL MANAGED LOCATIONS</div>
          <div className="admin-kpi-value">{locations.length} Facilities</div>
          <div className="admin-kpi-trend">{totalSlotsCount} Total Capacity</div>
        </div>

        <div className="glass-card admin-kpi-card">
          <div className="admin-kpi-label">TOTAL REGISTERED USERS</div>
          <div className="admin-kpi-value">{users.length} Users</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>Drivers & Owners</div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="admin-tabs">
        {[
          { id: 'OVERVIEW', label: 'Overview & Telemetry', icon: Activity },
          { id: 'LOCATIONS', label: 'Locations Manager', icon: MapPin },
          { id: 'SLOTS', label: 'Slot Control Grid', icon: Layers },
          { id: 'BOOKINGS', label: 'Master Bookings', icon: CalendarCheck },
          { id: 'SESSIONS', label: 'Live Barrier Log', icon: Car },
          { id: 'USERS', label: 'User Directory', icon: Users }
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
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Live Facility Network Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {locations.map(loc => (
                <div key={loc.id} style={{ background: '#070709', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#fff' }}>{loc.name}</span>
                    <span className="badge badge-available">ACTIVE</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{loc.address}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    <span>Capacity: {loc.total_slots} Slots</span>
                    <span>Approval: {loc.approval_mode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCATIONS MANAGER */}
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{loc.name}</span>
                    <span className="badge badge-dark">ID #{loc.id}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{loc.address} &bull; Capacity: {loc.total_slots} slots</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedLocationForSlot(loc);
                      setNewSlot({ ...newSlot, location_id: loc.id });
                      setShowAddSlotModal(true);
                    }}
                  >
                    <Plus size={14} /> Add Slot
                  </button>
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

      {/* TAB 3: SLOTS GRID */}
      {activeTab === 'SLOTS' && (
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Master Slot Telemetry & Status Override</h3>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (locations.length > 0) {
                  setSelectedLocationForSlot(locations[0]);
                  setNewSlot({ ...newSlot, location_id: locations[0].id });
                  setShowAddSlotModal(true);
                }
              }}
            >
              <Plus size={16} /> Create New Slot
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Toggle maintenance locks or status overrides for any slot in real-time.
            </p>

            {locations.map(loc => (
              <div key={loc.id} style={{ marginBottom: '28px' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>
                  {loc.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ borderStyle: 'dashed', padding: '16px', flexDirection: 'column', height: '100%' }}
                    onClick={() => {
                      setSelectedLocationForSlot(loc);
                      setNewSlot({ ...newSlot, location_id: loc.id });
                      setShowAddSlotModal(true);
                    }}
                  >
                    <Plus size={20} />
                    <span>Add Slot to Hub</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>System Bookings Master Registry</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                    Booking #{b.id} &bull; User ID #{b.user_id}
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

      {/* TAB 5: SESSIONS */}
      {activeTab === 'SESSIONS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Live Barrier Sessions Log</h3>
          <div className="glass-card" style={{ padding: '24px' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', padding: '14px 0' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '700' }}>Session #{s.id} (Booking #{s.booking_id})</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Entry: {new Date(s.entry_time).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${s.exit_time ? 'badge-dark' : 'badge-available'}`}>
                    {s.exit_time ? 'Checked Out' : 'Active Inside Garage'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>User & Account Directory</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {users.map(u => (
              <div key={u.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>{u.full_name}</span>
                  <span className="badge badge-dark">{u.role}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email: {u.email}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {u.phone || 'N/A'}</div>
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

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Publish Location
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD SLOT MODAL */}
      {showAddSlotModal && (
        <div className="modal-overlay" onClick={() => setShowAddSlotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Create Parking Slot</h3>
            <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  SLOT NUMBER *
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-105"
                  className="input-field"
                  value={newSlot.slot_number}
                  onChange={(e) => setNewSlot({ ...newSlot, slot_number: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    CATEGORY
                  </label>
                  <select
                    className="input-field"
                    value={newSlot.vehicle_type}
                    onChange={(e) => setNewSlot({ ...newSlot, vehicle_type: e.target.value })}
                  >
                    <option value="FOUR_WHEELER">Four-Wheeler</option>
                    <option value="TWO_WHEELER">Two-Wheeler</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    HOURLY PRICE ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={newSlot.hourly_price}
                    onChange={(e) => setNewSlot({ ...newSlot, hourly_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Save Slot Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
