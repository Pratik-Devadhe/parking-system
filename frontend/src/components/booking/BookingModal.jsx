import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, Car, CreditCard, ShieldCheck, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import './BookingModal.css';

function BookingModal({ location, slot, onClose, onBookingSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 125 * 60000).toISOString().slice(0, 16);

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [paymentMethod, setPaymentMethod] = useState('DIRECT');
  
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUserVehicles() {
      if (user) {
        const vList = await apiService.getVehiclesByUser(user.id);
        setVehicles(vList || []);
        if (vList && vList.length > 0) {
          setSelectedVehicleId(vList[0].id);
        }
      }
    }
    loadUserVehicles();
  }, [user]);

  // Calculate pricing
  const hourlyRate = slot ? Number(slot.hourly_price) : 10.00;
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  const diffHours = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60)));
  const totalPrice = (diffHours * hourlyRate).toFixed(2);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Vehicle Registration Check
    if (!vehicles || vehicles.length === 0 || !selectedVehicleId) {
      setError('Vehicle is not registered! Please register your vehicle first in "My Vehicles".');
      return;
    }

    // 2. Slot Availability Check
    if (slot && slot.status && slot.status !== 'AVAILABLE') {
      setError(`Slot ${slot.slot_number} is currently marked as ${slot.status} and cannot be booked.`);
      return;
    }

    if (endMs <= startMs) {
      setError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const slotId = slot.id;
      const startIso = new Date(startTime).toISOString();
      const endIso = new Date(endTime).toISOString();

      // Check slot availability via backend POST /booking/availability
      const availCheck = await apiService.checkAvailability({ slot_id: slotId, start_time: startIso, end_time: endIso });
      if (availCheck && availCheck.available === false) {
        setSubmitting(false);
        setError(availCheck.message || 'Slot is already booked for the selected time window.');
        return;
      }

      const bookingData = {
        user_id: user?.id,
        vehicle_id: selectedVehicleId,
        slot_id: slotId,
        start_time: startIso,
        end_time: endIso,
        total_amount: totalPrice
      };

      const result = await apiService.createBooking(bookingData);
      setSubmitting(false);

      if (result) {
        setConfirmedBooking(result);
        if (onBookingSuccess) onBookingSuccess(result);
      } else {
        setError('Failed to process reservation. Please try again.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Error communicating with booking server.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header-container">
          <div>
            <span className="badge badge-dark">
              SLOT RECOVERY & RESERVATION
            </span>
            <h3 className="modal-header-title">
              Reserve Slot {slot ? slot.slot_number : 'A-01'}
            </h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="booking-success-container">
            <div className="booking-success-icon-box">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="booking-success-title">Reservation Confirmed!</h3>
            <p className="booking-success-subtitle">
              Booking #{confirmedBooking.id} has been recorded in the database.
            </p>

            <div className="glass-card booking-summary-card">
              <div className="booking-summary-row">
                <span className="booking-summary-label">Location:</span>
                <span className="booking-summary-val">{location ? location.name : confirmedBooking.location_name}</span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Assigned Slot:</span>
                <span className="booking-summary-val highlight">{slot ? slot.slot_number : confirmedBooking.slot_number}</span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Vehicle:</span>
                <span className="booking-summary-val">{confirmedBooking.vehicle_number || 'Registered Vehicle'}</span>
              </div>
              <div className="booking-summary-row total-row">
                <span className="booking-summary-val">Total Paid:</span>
                <span className="booking-summary-val total-price">${confirmedBooking.total_amount}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="booking-form">
            
            {/* Location & Slot Info summary */}
            <div className="booking-location-box">
              <div>
                <div className="booking-box-label">LOCATION</div>
                <div className="booking-box-name">{location ? location.name : 'Apex Grand Garage'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="booking-box-label">RATE</div>
                <div className="booking-box-rate">${hourlyRate}/hr</div>
              </div>
            </div>

            {error && (
              <div className="booking-error-banner">
                {error}
              </div>
            )}

            {/* Vehicle Selection */}
            <div>
              <label className="booking-field-label">
                SELECT REGISTERED VEHICLE *
              </label>
              {vehicles.length > 0 ? (
                <select
                  className="input-field"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.vehicle_number}) - {v.vehicle_type}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-strong)', padding: '14px', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e53e3e', fontWeight: '800', fontSize: '0.88rem' }}>
                    <AlertTriangle size={18} /> Vehicle is not registered!
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    You must register your vehicle first before reserving a slot.
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                    onClick={() => {
                      onClose();
                      navigate('/vehicles');
                    }}
                  >
                    <Car size={14} /> Register Vehicle in "My Vehicles"
                  </button>
                </div>
              )}
            </div>

            {/* Time Selectors */}
            <div className="booking-time-grid">
              <div>
                <label className="booking-field-label">
                  START TIME
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="booking-field-label">
                  END TIME
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector (Direct Confirmation Mode) */}
            <div>
              <label className="booking-field-label">
                RESERVATION METHOD
              </label>
              <div className="payment-methods-grid">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('DIRECT')}
                  className={`payment-method-btn ${paymentMethod === 'DIRECT' ? 'active' : ''}`}
                >
                  Direct Confirmation (No Payment Gateway Needed)
                </button>
              </div>
            </div>

            {/* Total Summary Breakdown */}
            <div className="booking-cost-breakdown">
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Duration: {diffHours} Hour(s)</span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Includes barrier entry token & sensor lock</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Slot Fee</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>${totalPrice}</div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary booking-submit-btn"
              disabled={submitting || vehicles.length === 0}
            >
              {submitting ? 'Confirming Reservation...' : vehicles.length === 0 ? 'Vehicle Registration Required' : `Confirm Slot Reservation ($${totalPrice})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingModal;
