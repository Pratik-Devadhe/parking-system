import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Car, Plus, Trash2, ShieldCheck, X } from 'lucide-react';
import './VehiclesPage.css';

function VehiclesPage() {

  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    vehicle_type: 'FOUR_WHEELER',
    brand: '',
    model: ''
  });

  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.id) {
        const data = await apiService.getVehiclesByUser(user.id);
        setVehicles(data || []);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.vehicle_number) return;

    const payload = {
      ...newVehicle,
      user_id: user?.id
    };

    try {
      const res = await apiService.createVehicle(payload);
      if (res) {
        setShowAddModal(false);
        setNewVehicle({ vehicle_number: '', vehicle_type: 'FOUR_WHEELER', brand: '', model: '' });
        fetchVehicles();
      } else {
        alert('Failed to register vehicle.');
      }
    } catch (err) {
      alert('Unable to register vehicle. Please check your connection.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle plate from your account?')) {
      await apiService.deleteVehicle(id);
      fetchVehicles();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="vehicles-page-header">
        <div>
          <span className="badge badge-dark" style={{ marginBottom: '8px' }}>FLEET MANAGEMENT</span>
          <h1 className="vehicles-page-title">Registered Vehicles</h1>
          <p className="vehicles-page-sub">
            Manage your license plate numbers for automated gate barrier recognition.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Vehicle Plate
        </button>
      </div>

      {error ? (
        <div className="glass-card vehicles-empty-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Unable to load vehicles</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchVehicles}>Retry</button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading registered fleet...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-card vehicles-empty-card">
          <Car size={48} className="vehicles-empty-icon" />
          <h3 className="vehicles-empty-title">No Vehicles Registered</h3>
          <p className="vehicles-empty-desc">Add your license plate for seamless automatic gate opening.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Register First Vehicle
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((v) => (
            <div key={v.id} className="glass-card vehicle-card">
              <div>
                <div className="vehicle-card-top">
                  <div className="vehicle-card-type-badge">
                    <Car size={14} /> {v.vehicle_type === 'FOUR_WHEELER' ? 'Car / SUV' : 'Motorcycle'}
                  </div>
                  <button 
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="vehicle-delete-btn"
                    title="Remove Vehicle"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="vehicle-plate-number">
                  {v.vehicle_number}
                </div>
                <div className="vehicle-brand-model">
                  {v.brand || 'Vehicle'} {v.model || ''}
                </div>
              </div>

              <div className="vehicle-card-footer">
                <span className="vehicle-status-verified">
                  <ShieldCheck size={14} /> License Plate Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Register New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={ handleAddVehicle } className="vehicle-form">
              <div>
                <label className="booking-field-label">
                  LICENSE PLATE NUMBER *
                </label>
                <input
                  type="text"
                  placeholder="e.g. NY-PX-9988"
                  className="input-field"
                  value={newVehicle.vehicle_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="booking-field-label">
                  VEHICLE CATEGORY
                </label>
                <select
                  className="input-field"
                  value={newVehicle.vehicle_type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })}
                >
                  <option value="FOUR_WHEELER">Four-Wheeler (Car / Truck)</option>
                  <option value="TWO_WHEELER">Two-Wheeler (Bike / Scooter)</option>
                </select>
              </div>

              <div className="vehicle-form-grid-2">
                <div>
                  <label className="booking-field-label">
                    BRAND
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BMW"
                    className="input-field"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="booking-field-label">
                    MODEL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M3"
                    className="input-field"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Vehicle Plate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiclesPage;
