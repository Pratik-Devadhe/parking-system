import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  User,
  X,
  Filter
} from 'lucide-react';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'DRIVER',
    password: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    const data = await apiService.getAllUsers();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email) return;

    if (newUser.role === 'ADMIN') {
      alert('Creating additional ADMIN users is prohibited. System Administrator is a restricted single account.');
      return;
    }

    const res = await apiService.createUser(newUser);
    if (res && !res.error) {
      fetchUsers();
      setShowAddModal(false);
      setNewUser({ full_name: '', email: '', phone: '', role: 'DRIVER', password: '' });
    } else {
      alert(res?.error || 'Failed to create user.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user from the directory?')) {
      await apiService.deleteUser(id);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const driverCount = users.filter(u => u.role === 'DRIVER').length;
  const adminCount = users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length;

  return (
    <div>
      {/* HEADER BANNER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-dark" style={{ marginBottom: '8px' }}>IDENTITY & ACCESS CONTROL</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>PARK-X User Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage registered driver accounts, facility admins, and role permissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            <RefreshCw size={16} /> Sync Users
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>
            TOTAL ACCOUNTS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
            {users.length} Users
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px' }}>Active Directory</div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>
            REGISTERED DRIVERS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
            {driverCount} Drivers
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '6px' }}>Park-X App Drivers</div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px' }}>
            ADMINS & OWNERS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
            {adminCount} System Admins
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px' }}>Full Portal Access</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{
          background: '#070709',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flex: '1 1 300px',
          maxWidth: '450px'
        }}>
          <Search size={18} color="var(--text-subtle)" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
        </div>

        <div className="users-role-filters">
          <span className="users-filter-label">ROLE:</span>
          {['ALL', 'DRIVER', 'ADMIN', 'OWNER'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="users-loading-state">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card users-empty-state">
          <Users size={48} className="empty-state-icon" />
          <h3>No Users Found</h3>
          <p>No user records match your search filter.</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(u => {
            const isAdmin = u.role === 'ADMIN' || u.role === 'OWNER';
            return (
              <div key={u.id} className="glass-card user-card">
                <div>
                  <div className="user-card-header">
                    <div className="user-avatar-wrapper">
                      <div className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                        {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="user-name">
                          {u.full_name}
                        </h3>
                        <span className={`badge ${isAdmin ? 'badge-available' : 'badge-dark'}`}>
                          {u.role}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="user-delete-btn"
                      title="Remove User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="user-info-list">
                    <div className="user-info-item">
                      <Mail size={15} className="user-info-icon" />
                      <span>{u.email}</span>
                    </div>
                    <div className="user-info-item">
                      <Phone size={15} className="user-info-icon" />
                      <span>{u.phone || '+1 555-0199'}</span>
                    </div>
                  </div>
                </div>

                <div className="user-card-footer">
                  <span className="user-status">Status: <strong>{u.status || 'ACTIVE'}</strong></span>
                  <span className="user-verified">
                    <CheckCircle2 size={12} /> Verified Identity
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Add New User Account</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  FULL NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  className="input-field"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  className="input-field"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0123"
                    className="input-field"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    USER ROLE
                  </label>
                  <select
                    className="input-field"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="DRIVER">DRIVER</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  INITIAL PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                Register Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
