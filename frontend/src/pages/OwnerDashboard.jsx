import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  Building2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Layers,
  Calendar,
  Lock,
  BarChart3,
  AlertCircle,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  UserPlus
} from 'lucide-react';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const { user, role, switchRole } = useAuth();
  const ownerId = user?.id || 3;

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Selected state
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Forms
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_slots: 15,
    operating_hours_start: '06:00:00',
    operating_hours_end: '23:59:59',
    approval_mode: 'AUTO',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000'
  });

  const [newSlot, setNewSlot] = useState({
    location_id: '',
    slot_number: '',
    vehicle_type: 'FOUR_WHEELER',
    dimensions: '2.5m x 5.0m',
    hourly_price: 12.00,
    daily_price: 65.00,
    monthly_price: 350.00
  });

  const [blockForm, setBlockForm] = useState({
    slot_id: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  });

  const loadOwnerData = async () => {
    setLoading(true);
    const [locs, allSlots, bks, earnData] = await Promise.all([
      apiService.getLocationsByOwner(ownerId),
      apiService.getAllSlots(),
      apiService.getBookingsByOwner(ownerId),
      apiService.getOwnerEarnings(ownerId)
    ]);
    setLocations(locs || []);
    setSlots(allSlots || []);
    setBookings(bks || []);
    setEarnings(earnData);
    setLoading(false);
  };

  useEffect(() => {
    if (role === 'OWNER' || role === 'ADMIN') {
      loadOwnerData();
    }
  }, [ownerId, role]);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.address) return;

    await apiService.createLocation({ ...newLocation, owner_id: ownerId });
    setShowAddLocationModal(false);
    setNewLocation({
      name: '',
      address: '',
      total_slots: 15,
      operating_hours_start: '06:00:00',
      operating_hours_end: '23:59:59',
      approval_mode: 'AUTO',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000'
    });
    loadOwnerData();
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.slot_number || !newSlot.location_id) return;

    await apiService.createSlot(newSlot);
    setShowAddSlotModal(false);
    loadOwnerData();
  };

  const handleApproveBooking = async (id) => {
    await apiService.approveBooking(id);
    loadOwnerData();
  };

  const handleRejectBooking = async (id) => {
    await apiService.rejectBooking(id);
    loadOwnerData();
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    if (!blockForm.slot_id) return;

    await apiService.blockSlotTimeframe(
      blockForm.slot_id,
      blockForm.start_time,
      blockForm.end_time,
      ownerId
    );
    setShowBlockModal(false);
    loadOwnerData();
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this parking location listing?')) {
      await apiService.deleteLocation(id);
      loadOwnerData();
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Delete this parking slot?')) {
      await apiService.deleteSlot(slotId);
      loadOwnerData();
    }
  };

  // Real-world Portal Access Gateway
  if (role !== 'OWNER' && role !== 'ADMIN') {
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
            <Building2 size={32} />
          </div>

          <span className="badge owner-badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            PARKING OWNER & PARTNER PORTAL
          </span>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>
            Become a Park-X Space Host
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
            List your driveway, garage, commercial parking lot, or open land on Park-X. Set custom rental prices, approve driver reservations, and earn automated monthly payouts.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => {
                switchRole('OWNER');
                loadOwnerData();
              }}
            >
              <Sparkles size={18} /> Switch to Owner Portal View
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.booking_status === 'PENDING');
  const ownerSlots = slots.filter(s => locations.some(l => l.id === s.location_id));

  return (
    <div className="owner-dashboard-container">
      {/* OWNER HEADER BANNER */}
      <div className="owner-header-strip">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge owner-badge">
              <Building2 size={14} /> PARKING OWNER HUB
            </span>
            {user?.is_verified ? (
              <span className="badge badge-verified">
                <ShieldCheck size={14} /> VERIFIED OWNER
              </span>
            ) : (
              <span className="badge badge-pending">
                <ShieldAlert size={14} /> VERIFICATION PENDING
              </span>
            )}
          </div>
          <h1 className="owner-title">Owner Management Console</h1>
          <p className="owner-subtitle">
            Manage your parking listings, configure rental pricing, review booking requests, and track earnings.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddLocationModal(true)}>
          <Plus size={16} /> Add Parking Listing
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="owner-kpi-grid">
        <div className="glass-card owner-kpi-card">
          <div className="owner-kpi-label">TOTAL EARNINGS</div>
          <div className="owner-kpi-value">${Number(earnings?.stats?.total_earnings || 0).toFixed(2)}</div>
          <div className="owner-kpi-sub text-muted">From confirmed & completed bookings</div>
        </div>

        <div className="glass-card owner-kpi-card">
          <div className="owner-kpi-label">TOTAL LISTINGS</div>
          <div className="owner-kpi-value">{locations.length} Facilities</div>
          <div className="owner-kpi-sub text-muted">{ownerSlots.length} Active Slots Managed</div>
        </div>

        <div className="glass-card owner-kpi-card">
          <div className="owner-kpi-label">PENDING APPROVALS</div>
          <div className="owner-kpi-value" style={{ color: pendingBookings.length > 0 ? 'var(--status-res-text)' : 'var(--text-main)' }}>
            {pendingBookings.length} Requests
          </div>
          <div className="owner-kpi-sub text-muted">Requires owner review</div>
        </div>

        <div className="glass-card owner-kpi-card">
          <div className="owner-kpi-label">TOTAL BOOKINGS</div>
          <div className="owner-kpi-value">{bookings.length}</div>
          <div className="owner-kpi-sub text-muted">{earnings?.stats?.completed_bookings || 0} Completed Sessions</div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="owner-tabs">
        {[
          { id: 'OVERVIEW', label: 'Overview & Telemetry', icon: BarChart3 },
          { id: 'LISTINGS', label: 'Listings & Slots Manager', icon: Building2 },
          { id: 'REQUESTS', label: `Booking Requests (${pendingBookings.length})`, icon: Clock },
          { id: 'BLOCK', label: 'Block Unavailable Dates', icon: Lock },
          { id: 'EARNINGS', label: 'Earnings & Analytics', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`owner-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px' }}>
          {pendingBookings.length > 0 && (
            <div className="glass-card alert-banner-card">
              <AlertCircle size={20} style={{ color: 'var(--status-res-text)' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--text-main)' }}>Action Needed: {pendingBookings.length} Pending Booking Requests</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Drivers are waiting for your approval to confirm their reservations.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('REQUESTS')}>
                Review Requests
              </button>
            </div>
          )}

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>My Active Facilities Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {locations.map(loc => {
                const locSlots = slots.filter(s => s.location_id === loc.id);
                return (
                  <div key={loc.id} className="facility-mini-card">
                    {loc.primary_image && (
                      <img src={loc.primary_image} alt={loc.name} className="facility-mini-img" />
                    )}
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>{loc.name}</span>
                        <span className={`badge ${loc.approval_mode === 'AUTO' ? 'badge-available' : 'badge-pending'}`}>
                          {loc.approval_mode} APPROVAL
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {loc.address}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                        <span>Capacity: {loc.total_slots} slots</span>
                        <span>Slots Added: {locSlots.length}</span>
                        <span>Hours: {loc.operating_hours_start?.slice(0, 5)} - {loc.operating_hours_end?.slice(0, 5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LISTINGS & SLOTS MANAGER */}
      {activeTab === 'LISTINGS' && (
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Manage Parking Listings & Slots</h3>
            <button className="btn btn-primary" onClick={() => setShowAddLocationModal(true)}>
              <Plus size={16} /> Add Listing
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {locations.map(loc => {
              const locSlots = slots.filter(s => s.location_id === loc.id);
              return (
                <div key={loc.id} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{loc.name}</span>
                        <span className={`badge ${loc.approval_mode === 'AUTO' ? 'badge-available' : 'badge-pending'}`}>
                          Approval: {loc.approval_mode}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {loc.address} &bull; Capacity: {loc.total_slots} slots &bull; Hours: {loc.operating_hours_start} to {loc.operating_hours_end}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setNewSlot({ ...newSlot, location_id: loc.id });
                          setShowAddSlotModal(true);
                        }}
                      >
                        <Plus size={14} /> Add Slot to Listing
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLocation(loc.id)}>
                        <Trash2 size={14} /> Delete Listing
                      </button>
                    </div>
                  </div>

                  {/* SLOTS LIST FOR THIS LOCATION */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-subtle)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Configured Parking Slots ({locSlots.length})
                  </h4>

                  {locSlots.length === 0 ? (
                    <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No slots created for this listing yet. Click "Add Slot to Listing" above.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {locSlots.map(s => (
                        <div key={s.id} className="slot-owner-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>Slot {s.slot_number}</span>
                            <span className={`badge ${s.status === 'AVAILABLE' ? 'badge-available' : s.status === 'OCCUPIED' ? 'badge-dark' : 'badge-pending'}`}>
                              {s.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Type: {s.vehicle_type === 'TWO_WHEELER' ? '2-Wheeler' : '4-Wheeler'} &bull; {s.dimensions}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-teal)', marginBottom: '10px' }}>
                            ${s.hourly_price}/hr &bull; ${s.daily_price}/day &bull; ${s.monthly_price}/mo
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                            <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteSlot(s.id)}>
                              <Trash2 size={12} /> Remove Slot
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
            Pending Driver Reservation Requests
          </h3>

          {pendingBookings.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--status-avail-text)', marginBottom: '12px' }} />
              <h4>No pending approval requests</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                All driver bookings are currently up to date or auto-approved.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingBookings.map(b => (
                <div key={b.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Booking #{b.id}</span>
                      <span className="badge badge-pending">PENDING APPROVAL</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      Facility: <strong>{b.parking_name || b.location_name}</strong> &bull; Slot: <strong>{b.slot_number}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                      Driver: {b.driver_name || b.full_name} &bull; Vehicle: {b.vehicle_number} &bull; Window: {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-teal)', marginTop: '6px' }}>
                      Total Amount: ${b.total_amount}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleApproveBooking(b.id)}>
                      <CheckCircle2 size={16} /> Approve Reservation
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectBooking(b.id)}>
                      <XCircle size={16} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BLOCK UNAVAILABLE DATES/TIMES */}
      {activeTab === 'BLOCK' && (
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Block Slot Timeframes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Block specific slots for maintenance, private events, or scheduled closures.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowBlockModal(true)}>
              <Lock size={16} /> Create Time Blockade
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Active Slot Blockades & Maintenance Windows</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.filter(b => b.booking_status === 'BLOCKED').length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slot blockades currently scheduled.</p>
              ) : (
                bookings.filter(b => b.booking_status === 'BLOCKED').map(b => (
                  <div key={b.id} style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>Blocked Slot ID #{b.slot_id}</span>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        From {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleString()}
                      </div>
                    </div>
                    <span className="badge badge-dark">BLOCKED</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EARNINGS & ANALYTICS */}
      {activeTab === 'EARNINGS' && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Revenue & Earnings Reports</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-subtle)', marginBottom: '8px' }}>GROSS PLATFORM EARNINGS</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                ${Number(earnings?.stats?.total_earnings || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-avail-text)', marginTop: '6px', fontWeight: '700' }}>100% Payout verified</div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-subtle)', marginBottom: '8px' }}>COMPLETED SESSIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                {earnings?.stats?.completed_bookings || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Finished driver reservations</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Revenue Breakdown by Facility</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {earnings?.location_breakdown?.map(item => (
                <div key={item.location_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.location_name}</span>
                  </div>
                  <span style={{ fontWeight: '800', color: 'var(--primary-teal)' }}>
                    ${Number(item.revenue || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE LOCATION MODAL */}
      {showAddLocationModal && (
        <div className="modal-overlay" onClick={() => setShowAddLocationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>Create Parking Facility Listing</h3>
            <form onSubmit={handleCreateLocation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label">FACILITY NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Grand City Plaza Parking Garage"
                  className="input-field"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label">ADDRESS / LOCATION *</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Fifth Avenue, Midtown"
                  className="input-field"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="field-label">TOTAL CAPACITY SLOTS</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newLocation.total_slots}
                    onChange={(e) => setNewLocation({ ...newLocation, total_slots: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="field-label">APPROVAL MODE</label>
                  <select
                    className="input-field"
                    value={newLocation.approval_mode}
                    onChange={(e) => setNewLocation({ ...newLocation, approval_mode: e.target.value })}
                  >
                    <option value="AUTO">AUTO (Instant Driver Confirmation)</option>
                    <option value="MANUAL">MANUAL (Owner Review Required)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Publish Parking Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      {showAddSlotModal && (
        <div className="modal-overlay" onClick={() => setShowAddSlotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
              Add Parking Slot to Listing
            </h3>
            <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label">SELECT FACILITY LISTING *</label>
                <select
                  className="input-field"
                  value={newSlot.location_id}
                  onChange={(e) => setNewSlot({ ...newSlot, location_id: e.target.value })}
                  required
                >
                  <option value="">Select Facility...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="field-label">SLOT NUMBER *</label>
                  <input
                    type="text"
                    placeholder="e.g. A-101"
                    className="input-field"
                    value={newSlot.slot_number}
                    onChange={(e) => setNewSlot({ ...newSlot, slot_number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="field-label">VEHICLE COMPATIBILITY</label>
                  <select
                    className="input-field"
                    value={newSlot.vehicle_type}
                    onChange={(e) => setNewSlot({ ...newSlot, vehicle_type: e.target.value })}
                  >
                    <option value="FOUR_WHEELER">Four-Wheeler</option>
                    <option value="TWO_WHEELER">Two-Wheeler</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="field-label">HOURLY ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={newSlot.hourly_price}
                    onChange={(e) => setNewSlot({ ...newSlot, hourly_price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="field-label">DAILY ($)</label>
                  <input
                    type="number"
                    step="1"
                    className="input-field"
                    value={newSlot.daily_price}
                    onChange={(e) => setNewSlot({ ...newSlot, daily_price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="field-label">MONTHLY ($)</label>
                  <input
                    type="number"
                    step="10"
                    className="input-field"
                    value={newSlot.monthly_price}
                    onChange={(e) => setNewSlot({ ...newSlot, monthly_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Save Parking Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
