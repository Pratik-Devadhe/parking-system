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
  Sparkles,
  Layers,
  CalendarCheck,
  Calendar
} from 'lucide-react';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Search & Filter State (Satisfying Driver Features Requirements)
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingModalLocation, setBookingModalLocation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const data = await apiService.getLocations();
    setLocations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const filters = {
      query: searchQuery,
      vehicle_type: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
      start_time: startTime || undefined,
      end_time: endTime || undefined
    };
    const results = await apiService.searchLocations(filters);
    setLocations(results || []);
    setLoading(false);
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = !searchQuery ||
                          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenSlotModal = async (loc) => {
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
            Find & Reserve Parking Nearby. <br />
            <span className="home-hero-subtitle-muted">Search by location, date, time & vehicle type.</span>
          </h1>

          <p className="home-hero-desc">
            Real-time ultrasonic slot monitoring, automated gate barriers, and advance reservations for 2-wheelers and 4-wheelers.
          </p>

          {/* DRIVER MULTI-FILTER SEARCH BAR */}
<form
  className="home-search-form"
  onSubmit={handleSearchSubmit}
>
  <div className="home-search-header">
    <div>
      <h3>Find a Parking Slot</h3>
      <p>Search available parking based on your location and time.</p>
    </div>
  </div>

  <div className="home-search-fields">

    {/* Location */}
    <div className="home-search-field location-field">
      <label>Location</label>

      <div className="home-search-input-wrapper">
        <MapPin size={19} />
        <input
          type="text"
          placeholder="Enter location or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    {/* Start Time */}
    <div className="home-search-field">
      <label>Start Time</label>

      <div className="home-search-input-wrapper">
        <Calendar size={19} />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
    </div>

    {/* End Time */}
    <div className="home-search-field">
      <label>End Time</label>

      <div className="home-search-input-wrapper">
        <Clock size={19} />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
    </div>

    {/* Vehicle */}
    <div className="home-search-field">
      <label>Vehicle Type</label>

      <div className="home-search-input-wrapper">
        <Car size={19} />

        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
        >
          <option value="ALL">All Vehicles</option>
          <option value="FOUR_WHEELER">
            4-Wheeler (Car/SUV)
          </option>
          <option value="TWO_WHEELER">
            2-Wheeler (Bike/Scooter)
          </option>
        </select>
      </div>
    </div>

  </div>

  {/* Search Button */}
  <div className="home-search-footer">
    <span className="home-search-hint">
      Find the best available parking near you
    </span>

    <button
      type="submit"
      className="home-search-button"
    >
      <Search size={19} />
      Search Available Slots
    </button>
  </div>
</form>
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
            <div className="home-metric-label">Verified Facilities</div>
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
            Select a location to inspect slot compatibility, operating hours & reserve in advance
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
          Searching parking network data...
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
                {loc.primary_image && (
                  <img src={loc.primary_image} alt={loc.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }} />
                )}

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
                      {loc.approval_mode === 'AUTO' ? '⚡ Instant Auto' : '📝 Manual Review'}
                    </div>
                  </div>
                  <div>
                    <div className="home-location-info-lbl">HOURS</div>
                    <div className="home-location-info-val">
                      {loc.operating_hours_start?.slice(0, 5)} - {loc.operating_hours_end?.slice(0, 5)}
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
                  <Layers size={16} /> View Details & Map
                </button>

                <button 
                  className="btn btn-primary home-location-action-btn" 
                  onClick={() => handleOpenSlotModal(loc)}
                >
                  <CalendarCheck size={16} /> Reserve Spot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOW IT WORKS PROCESS SECTION */}
      <div className="glass-card home-process-container">
        <div className="home-process-header">
          <span className="badge badge-dark" style={{ marginBottom: '10px' }}>SEAMLESS DRIVER WORKFLOW</span>
          <h2 className="home-process-title">How PARK-X Works</h2>
          <p className="home-process-sub">
            Book your parking spot in 4 quick steps before you even leave home
          </p>
        </div>

        <div className="home-process-grid">
          <div className="home-process-step">
            <div className="home-process-step-num">1</div>
            <h4 className="home-process-step-title">Search & Filter</h4>
            <p className="home-process-step-desc">Filter nearby parking by location, arrival date/time & vehicle type (2W or 4W).</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">2</div>
            <h4 className="home-process-step-title">Select & Inspect</h4>
            <p className="home-process-step-desc">View slot dimensions, map location, hourly rates and availability window.</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">3</div>
            <h4 className="home-process-step-title">Reserve in Advance</h4>
            <p className="home-process-step-desc">Lock your time window in advance. Get instant confirmation and notification.</p>
          </div>

          <div className="home-process-step">
            <div className="home-process-step-num">4</div>
            <h4 className="home-process-step-title">Scan & Park</h4>
            <p className="home-process-step-desc">Automated gate barrier grants entry in seconds upon check-in.</p>
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
