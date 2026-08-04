import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import './BookingsPage.css';

function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPassBooking, setSelectedPassBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    if (user) {
      const data = await apiService.getBookingsByUser(user.id);
      setBookings(data);
    } else {
      const data = await apiService.getAllBookings();
      setBookings(data);
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

  return (
    <div>
      <div className="bookings-page-header">
        <h1 className="bookings-page-title">My Reservations & Digital Passes</h1>
        <p className="bookings-page-sub">
          Manage active parking reservations, access gate QR entry tokens, and view session history.
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
            const isConfirmed = b.booking_status === 'CONFIRMED' || b.booking_status === 'PENDING';
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
                        isConfirmed ? 'badge-available' : isCompleted ? 'badge-dark' : 'badge-occupied'
                      }`}>
                        {b.booking_status}
                      </span>
                    </div>

                    <div className="booking-card-location">
                      <MapPin size={16} color="#94a3b8" />
                      {b.location_name || 'Apex Grand Garage'}
                    </div>

                    <div className="booking-card-meta-list">
                      <div className="booking-card-meta-item">
                        <Car size={14} /> Plate: <strong className="booking-card-meta-text">{b.vehicle_number || 'Registered Vehicle'}</strong>
                      </div>
                      <div className="booking-card-meta-item">
                        <Clock size={14} /> Start: <strong className="booking-card-meta-text">{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
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
                    {isConfirmed && (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPassBooking(b)}
                        >
                          <QrCode size={16} /> Entry Pass
                        </button>

                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleCheckIn(b.id)}
                        >
                          <LogIn size={16} /> Check-In
                        </button>

                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCheckOut(b.id)}
                        >
                          <LogOut size={16} /> Check-Out
                        </button>

                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <span className="badge badge-dark">
                        <CheckCircle2 size={14} color="#10b981" /> Completed Session
                      </span>
                    )}

                    {isCancelled && (
                      <span className="badge badge-occupied">
                        <XCircle size={14} /> Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
                  [QR PASS #{selectedPassBooking.id}]
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
