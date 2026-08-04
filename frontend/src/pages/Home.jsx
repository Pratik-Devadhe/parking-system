import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import BookingModal from '../components/booking/BookingModal';
import { 
  Search, 
  MapPin, 
  Car, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Filter, 
  ArrowRight, 
  CheckCircle,
  Navigation,
  Sparkles,
  Layers,
  CalendarCheck
} from 'lucide-react';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingModalLocation, setBookingModalLocation] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await apiService.getLocations();
      setLocations(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenSlotModal = async (loc) => {
    setSelectedLocation(loc);
    const slots = await apiService.getSlotsByLocation(loc.id);
    const availableSlot = slots.find(s => s.status === 'AVAILABLE') || slots[0];
    if (availableSlot) {
      setSelectedSlotForBooking(availableSlot);
      setBookingModalLocation(loc);
    } else {
      alert('No available slots currently for this location.');
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <div className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-badge">
            <Sparkles size={14} /> AUTOMATED SMART PARKING NETWORK
          </div>

          <h1 className="home-hero-title">
            Next-Gen Parking. <br />
            <span className="home-hero-subtitle-muted">Guaranteed Spot in Seconds.</span>
          </h1>

          <p className="home-hero-desc">
            Real-time ultrasonic slot monitoring, automated gate barriers, and instant booking for high-end luxury garages and city hubs.
          </p>

          {/* HERO SEARCH BAR */}
          <div className="home-hero-search-box">
            <div className="home-hero-search-input-wrapper">
              <Search size={20} color="var(--text-subtle)" />
              <input
                type="text"
                placeholder="Search location, address, or city (e.g. Financial District)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-hero-search-input"
              />
            </div>
            <button className="btn btn-primary btn-lg home-hero-search-btn">
              Explore Hubs
            </button>
          </div>
        </div>
      </div>

      {/* METRICS BANNER */}
      <div className="home-metrics-grid">
        <div className="glass-card home-metric-card">
          <div className="home-metric-icon-box default">
            <MapPin size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div className="home-metric-val">{locations.length} Active Hubs</div>
            <div className="home-metric-label">Verified City Facilities</div>
          </div>
        </div>

        <div className="glass-card home-metric-card">
          <div className="home-metric-icon-box success">
            <Zap size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div className="home-metric-val">99.9% Accuracy</div>
            <div className="home-metric-label">Live Ultrasonic Telemetry</div>
          </div>
        </div>

        <div className="glass-card home-metric-card">
          <div className="home-metric-icon-box default">
            <ShieldCheck size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div className="home-metric-val">24/7 Security</div>
            <div className="home-metric-label">CCTV & License Recognition</div>
          </div>
        </div>

        <div className="glass-card home-metric-card">
          <div className="home-metric-icon-box warning">
            <Clock size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div className="home-metric-val">Instant Entry</div>
            <div className="home-metric-label">Automated Barrier Gate</div>
          </div>
        </div>
      </div>

      {/* LOCATIONS LIST HEADER */}
      <div className="home-locations-header">
        <div>
          <h2 className="home-locations-title">Available Parking Locations</h2>
          <p className="home-locations-sub">
            Select a location to inspect interactive slot maps & prices
          </p>
        </div>

        <div className="home-filter-controls">
          <span className="home-filter-label">Vehicle Filter:</span>
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
            Four-Wheeler
          </button>
          <button 
            className={`btn btn-sm ${vehicleFilter === 'TWO_WHEELER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setVehicleFilter('TWO_WHEELER')}
          >
            Two-Wheeler
          </button>
        </div>
      </div>

      {/* LOCATIONS GRID */}
      {loading ? (
        <div className="home-state-message">
          Loading parking network data...
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="glass-card home-state-message">
          No parking locations matched your search criteria.
        </div>
      ) : (
        <div className="home-locations-grid">
          {filteredLocations.map((loc) => (
            <div key={loc.id} className="glass-card home-location-card">
              <div>
                <div className="home-location-card-top">
                  <div>
                    <h3 className="home-location-card-name">
                      {loc.name}
                    </h3>
                    <div className="home-location-card-address">
                      <MapPin size={14} color="#94a3b8" />
                      {loc.address}
                    </div>
                  </div>
                  {loc.is_verified && (
                    <span className="badge badge-dark">
                      <ShieldCheck size={12} color="#10b981" /> Verified
                    </span>
                  )}
                </div>

                <p className="home-location-card-desc">
                  {loc.description || 'Modern parking facility with automated slot assignment and 24/7 barrier surveillance.'}
                </p>

                {/* Info Pills */}
                <div className="home-location-info-strip">
                  <div>
                    <div className="home-location-info-lbl">TOTAL SLOTS</div>
                    <div className="home-location-info-val">{loc.total_slots || 30} Capacity</div>
                  </div>
                  <div>
                    <div className="home-location-info-lbl">APPROVAL MODE</div>
                    <div className="home-location-info-val auto-mode">
                      {loc.approval_mode === 'AUTO' ? '⚡ Instant Auto' : '📝 Manual'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="home-location-actions">
                <button 
                  className="btn btn-secondary home-location-action-btn" 
                  onClick={() => navigate(`/location/${loc.id}`)}
                >
                  <Layers size={16} /> View Slot Grid
                </button>

                <button 
                  className="btn btn-primary home-location-action-btn" 
                  onClick={() => handleOpenSlotModal(loc)}
                >
                  <CalendarCheck size={16} /> Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOW IT WORKS PROCESS SECTION */}
      <div className="glass-card home-process-container">
        <div className="home-process-header">
          <span className="badge badge-dark" style={{ marginBottom: '10px' }}>SEAMLESS WORKFLOW</span>
          <h2 className="home-process-title">How PARK-X Works</h2>
          <p className="home-process-sub">
            Book your parking spot in 4 quick steps before you even leave home
          </p>
        </div>

        <div className="home-process-grid">
          <div className="home-process-step">
            <div className="home-process-step-num">1</div>
            <h4 className="home-process-step-title">Locate Facility</h4>
            <p className="home-process-step-desc">Search by address or nearby landmark on our live interactive network map.</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">2</div>
            <h4 className="home-process-step-title">Select Slot</h4>
            <p className="home-process-step-desc">Choose exact slot number (Two-wheeler or Four-wheeler) with hourly price locks.</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">3</div>
            <h4 className="home-process-step-title">Reserve & Pay</h4>
            <p className="home-process-step-desc">Complete checkout via Card, Apple Pay or UPI to generate your digital entry pass.</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">4</div>
            <h4 className="home-process-step-title">Scan & Park</h4>
            <p className="home-process-step-desc">Automated barrier recognizes license plate or QR pass to grant entry in &lt;15 seconds.</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSlotForBooking && bookingModalLocation && (
        <BookingModal
          location={bookingModalLocation}
          slot={selectedSlotForBooking}
          onClose={() => {
            setSelectedSlotForBooking(null);
            setBookingModalLocation(null);
          }}
          onBookingSuccess={() => {
            setSelectedSlotForBooking(null);
            setBookingModalLocation(null);
          }}
        />
      )}
    </div>
  );
}

export default Home;
