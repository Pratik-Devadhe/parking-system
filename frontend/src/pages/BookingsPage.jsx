import React, { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarCheck, 
  MapPin, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  LogOut, 
  LogIn, 
  Calendar,
  AlertTriangle,
  Send
} from 'lucide-react';
import './BookingsPage.css';

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    if (user) {
      const data = await apiService.getBookingsByUser(user.id);
      setBookings(data || []);
    } else {
      const data = await apiService.getAllBookings();
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCheckIn = async (id) => {
    await apiService.checkIn(id);
    fetchBookings();
  };

  const handleCheckOut = async (id) => {
    await apiService.checkOut(id);
    fetchBookings();
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await apiService.cancelBooking(id);
      fetchBookings();
    }
  };

  const handleFileDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeBooking || !disputeReason) return;

    await apiService.createDispute({
      booking_id: disputeBooking.id,
      user_id: user?.id || 1,
      reason: disputeReason,
      description: disputeDesc
    });

    alert('Dispute case submitted successfully! Support & Admin team notified.');
    setShowDisputeModal(false);
    setDisputeBooking(null);
    setDisputeReason('');
    setDisputeDesc('');
  };

  return (
    <div>
      <div className="bookings-page-header">
        <h1 className="bookings-page-title">My Reservations & Digital Passes</h1>
        <p className="bookings-page-sub">
          Manage active parking reservations, access gate QR entry tokens, view status history & submit support disputes.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Retrieving reservation records...
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card bookings-empty-card">
          <Calendar size={48} className="bookings-empty-icon" />
          <h3 className="bookings-empty-title">No Reservations Found</h3>
          <p className="bookings-empty-desc">
            You don't have any active or past parking bookings recorded in your account.
          </p>
          <a href="/" className="btn btn-primary">
            Find Parking Hub
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => {
            const isConfirmed = b.booking_status === 'CONFIRMED';
            const isPending = b.booking_status === 'PENDING';
            const isActive = b.booking_status === 'ACTIVE';
            const isCompleted = b.booking_status === 'COMPLETED';
            const isCancelled = b.booking_status === 'CANCELLED';

            return (
              <div key={b.id} className="glass-card booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-slot-badge">
                    <span className="booking-card-slot-lbl">SLOT</span>
                    <span className="booking-card-slot-num">{b.slot_number || 'A-01'}</span>
                  </div>

                  <div>
                    <div className="booking-card-info-header">
                      <h3 className="booking-card-id">Booking #{b.id}</h3>
                      <span className={`badge ${
                        isConfirmed || isActive ? 'badge-available' : isPending ? 'badge-pending' : isCompleted ? 'badge-dark' : 'badge-occupied'
                      }`}>
                        {b.booking_status}
                      </span>
                    </div>

                    <div className="booking-card-location">
                      <MapPin size={16} color="#94a3b8" />
                      {b.parking_name || b.location_name || 'Apex Grand Garage'}
                    </div>

                    <div className="booking-card-meta-list">
                      <div className="booking-card-meta-item">
                        <Car size={14} /> Plate: <strong className="booking-card-meta-text">{b.vehicle_number || 'Registered Vehicle'}</strong>
                      </div>
                      <div className="booking-card-meta-item">
                        <Clock size={14} /> Start: <strong className="booking-card-meta-text">{new Date(b.start_time).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & Price */}
                <div className="booking-card-actions">
                  <div className="booking-card-cost-box">
                    <div className="booking-card-cost-lbl">TOTAL PRICE</div>
                    <div className="booking-card-cost-val">${b.total_amount}</div>
                  </div>

                  <div className="booking-card-action-btns">
                    {isPending && (
                      <span className="badge badge-pending">
                        Waiting for Owner Approval
                      </span>
                    )}

                    {(isConfirmed || isActive) && (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPassBooking(b)}
                        >
                          <QrCode size={16} /> Digital Pass
                        </button>

                        {isConfirmed && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCheckIn(b.id)}
                          >
                            <LogIn size={16} /> Check-In Gate
                          </button>
                        )}

                        {isActive && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCheckOut(b.id)}
                          >
                            <LogOut size={16} /> Check-Out Gate
                          </button>
                        )}

                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {/* Dispute Button */}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => {
                        setDisputeBooking(b);
                        setShowDisputeModal(true);
                      }}
                    >
                      <AlertTriangle size={14} /> Report Issue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPUTE MODAL */}
      {showDisputeModal && disputeBooking && (
        <div className="modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
              Submit Dispute / Issue Ticket
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Booking #{disputeBooking.id} &bull; {disputeBooking.parking_name}
            </p>

            <form onSubmit={handleFileDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label">ISSUE REASON *</label>
                <select
                  className="input-field"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Incorrect Billing / Pricing">Incorrect Billing / Fee Issue</option>
                  <option value="Slot Occupied by Unauthorized Vehicle">Slot Occupied by Unauthorized Vehicle</option>
                  <option value="Barrier Gate Failed to Open">Barrier Gate Failed to Open</option>
                  <option value="Facility Facility Damage / Safety">Facility Safety / Maintenance Concern</option>
                  <option value="Other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="field-label">DETAILED DESCRIPTION</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Provide additional details for the support admin..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PASS MODAL */}
      {selectedPassBooking && (
        <div className="modal-overlay" onClick={() => setSelectedPassBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="qr-modal-body">
              <span className="badge badge-dark" style={{ marginBottom: '12px' }}>DIGITAL ENTRY PASS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>PARK-X FAST PASS</h3>
              <p className="qr-modal-desc">
                Hold barcode in front of the automated barrier scanner
              </p>

              <div className="qr-code-box">
                <div style={{ width: '180px', height: '180px', background: '#000000', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', border: '4px solid #000' }}>
                  <QRCode value={selectedPassBooking.id} size={200} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem' }}>
                <div>Slot: <strong style={{ color: '#10b981' }}>{selectedPassBooking.slot_number}</strong></div>
                <div>Plate: <strong style={{ color: '#ffffff' }}>{selectedPassBooking.vehicle_number}</strong></div>
                <div>Valid Until: <strong style={{ color: '#ffffff' }}>{new Date(selectedPassBooking.end_time).toLocaleString()}</strong></div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedPassBooking(null)}>
                Close Digital Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
