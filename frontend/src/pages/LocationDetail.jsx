import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import BookingModal from '../components/booking/BookingModal';
import { 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  Car, 
  Bike,
  CalendarCheck,
  RefreshCw
} from 'lucide-react';
import './LocationDetail.css';

function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');

  // Booking Modal
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchLocationData = async () => {
    setLoading(true);
    const [locations, slotsData, statsData] = await Promise.all([
      apiService.getLocations(),
      apiService.getSlotsByLocation(id),
      apiService.getSlotStats(id)
    ]);

    const loc = locations.find(l => l.id === Number(id)) || locations[0];
    setLocation(loc);
    setSlots(slotsData);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocationData();
  }, [id]);

  const filteredSlots = slots.filter(slot => {
    const matchesVehicle = vehicleFilter === 'ALL' || slot.vehicle_type === vehicleFilter;
    const matchesStatus = statusFilter === 'ALL' || slot.status === statusFilter;
    return matchesVehicle && matchesStatus;
  });

  const availableSlotsCount = slots.filter(s => s.status === 'AVAILABLE').length;
  const occupiedSlotsCount = slots.filter(s => s.status === 'OCCUPIED').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Loading location slot telemetry...
      </div>
    );
  }

  if (!location) {
    return (
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>Location Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px 0' }}>The requested parking facility ID does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Return to Hubs
        </button>
      </div>
    );
  }

  return (
    <div className="location-detail-container">
      <button className="btn btn-secondary btn-sm location-detail-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Hubs
      </button>

      {/* HEADER CARD */}
      <div className="glass-card location-detail-header-card">
        <div className="location-detail-top-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 className="location-detail-title">{location.name}</h1>
              {location.is_verified && (
                <span className="badge badge-dark">
                  <ShieldCheck size={12} color="#10b981" /> Verified Facility
                </span>
              )}
            </div>
            <div className="location-detail-address">
              <MapPin size={16} color="#94a3b8" />
              {location.address}
            </div>
          </div>

          <button className="btn btn-secondary" onClick={fetchLocationData}>
            <RefreshCw size={16} /> Refresh Slots
          </button>
        </div>

        <p className="location-detail-desc">
          {location.description || 'Equipped with real-time ultrasonic occupancy sensors and automated gate barrier controls. Guaranteed reservation locks.'}
        </p>

        {/* Stats Strip */}
        <div className="location-detail-stats-strip">
          <div className="location-detail-stat-card">
            <div className="location-detail-stat-label">TOTAL CAPACITY</div>
            <div className="location-detail-stat-val">{slots.length || location.total_slots || 30} Slots</div>
          </div>

          <div className="location-detail-stat-card">
            <div className="location-detail-stat-label">AVAILABLE NOW</div>
            <div className="location-detail-stat-val" style={{ color: '#10b981' }}>{availableSlotsCount} Open</div>
          </div>

          <div className="location-detail-stat-card">
            <div className="location-detail-stat-label">CURRENTLY OCCUPIED</div>
            <div className="location-detail-stat-val" style={{ color: '#f87171' }}>{occupiedSlotsCount} Parked</div>
          </div>

          <div className="location-detail-stat-card">
            <div className="location-detail-stat-label">BASE RATE</div>
            <div className="location-detail-stat-val">${slots[0]?.hourly_price || '10.00'}/hr</div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="location-detail-filter-bar">
        <div>
          <h3 className="location-detail-filter-title">Interactive Slot Layout</h3>
          <p className="location-detail-filter-sub">Click an open slot to lock in instant reservation</p>
        </div>

       
       <div className="location-detail-filter-btns">
  {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"].map((status) => (
    <button
      key={status}
      className={`btn btn-sm ${
        statusFilter === status ? "btn-primary" : "btn-secondary"
      }`}
      onClick={() => setStatusFilter(status)}
    >
      {status}
    </button>
  ))}
</div>

        <div className="location-detail-filter-btns">
          <button 
            className={`btn btn-sm ${vehicleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleFilter('ALL')}
          >
            All Types
          </button>
          <button 
            className={`btn btn-sm ${vehicleFilter === 'FOUR_WHEELER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleFilter('FOUR_WHEELER')}
          >
            4-Wheeler
          </button>
          <button 
            className={`btn btn-sm ${vehicleFilter === 'TWO_WHEELER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleFilter('TWO_WHEELER')}
          >
            2-Wheeler
          </button>
          <button 
            className={`btn btn-sm ${statusFilter === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(statusFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          >
            Open Only
          </button>
        </div>
      </div>

      {/* SLOTS GRID */}
      {filteredSlots.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No parking slots match the selected filters.
        </div>
      ) : (
        <div className="location-detail-slots-grid">
          {filteredSlots.map((slot) => {
            const isAvailable = slot.status === 'AVAILABLE';
            return (
              <div 
                key={slot.id} 
                className={`glass-card slot-card ${isAvailable ? 'available' : 'occupied'}`}
              >
                <div>
                  <div className="slot-card-header">
                    <span className="slot-card-number">Slot {slot.slot_number}</span>
                    <span className={`badge ${isAvailable ? 'badge-available' : 'badge-occupied'}`}>
                      {isAvailable ? 'AVAILABLE' : 'OCCUPIED'}
                    </span>
                  </div>

                  <div className="slot-card-category">
                    Category: <strong>{slot.vehicle_type === 'FOUR_WHEELER' ? 'Four-Wheeler' : 'Two-Wheeler'}</strong>
                  </div>

                  <div className="slot-card-rate-box">
                    <span className="slot-card-rate-lbl">RATE / HR</span>
                    <span className="slot-card-rate-val">${slot.hourly_price}</span>
                  </div>
                </div>

                {isAvailable ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <CalendarCheck size={16} /> Reserve Slot
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                    disabled
                  >
                    Occupied
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedSlot && (
        <BookingModal
          location={location}
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBookingSuccess={() => {
            setSelectedSlot(null);
            fetchLocationData();
          }}
        />
      )}
    </div>
  );
}

export default LocationDetail;
