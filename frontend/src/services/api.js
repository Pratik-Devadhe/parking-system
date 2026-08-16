// Centralized API Service for PARK-X Smart Parking System
// Synchronized with Backend Routes: /user, /location, /slot, /vehicle, /booking, /sessions, /notification, /dispute, /setting

const BASE_URL = 'http://localhost:8080';

// Fallback Mock Datasets
let mockLocations = [
  {
    id: 1,
    owner_id: 3,
    name: 'Apex Grand Tower Garage',
    address: '742 Park Avenue, Financial District',
    total_slots: 40,
    latitude: 40.7128,
    longitude: -74.0060,
    is_verified: true,
    operating_hours_start: '06:00:00',
    operating_hours_end: '23:59:59',
    approval_mode: 'AUTO',
    description: 'Multi-level automated garage with EV charging, 24/7 CCTV, and valet service.',
    primary_image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 2,
    owner_id: 3,
    name: 'Metro City Center Deck',
    address: '108 West 42nd Street, Downtown',
    total_slots: 24,
    latitude: 40.7580,
    longitude: -73.9855,
    is_verified: true,
    operating_hours_start: '00:00:00',
    operating_hours_end: '23:59:59',
    approval_mode: 'AUTO',
    description: 'Prime city center parking with high-capacity SUV spaces and smart barrier entry.',
    primary_image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 3,
    owner_id: 3,
    name: 'Silicon Hub Tech Park',
    address: '450 Innovation Way, Tech District',
    total_slots: 30,
    latitude: 40.7484,
    longitude: -73.9857,
    is_verified: true,
    operating_hours_start: '07:00:00',
    operating_hours_end: '22:00:00',
    approval_mode: 'MANUAL',
    description: 'Monitored tech park parking lot with covered slots and automated license plate recognition.',
    primary_image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 4,
    owner_id: 3,
    name: 'Harbor View Marina Lot',
    address: '88 Ocean Boulevard, Waterfront',
    total_slots: 18,
    latitude: 40.7050,
    longitude: -74.0150,
    is_verified: false,
    operating_hours_start: '05:00:00',
    operating_hours_end: '23:00:00',
    approval_mode: 'AUTO',
    description: 'Spacious waterfront parking with security patrols and oversize vehicle support.',
    primary_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000'
  }
];

let mockSlots = [
  { id: 101, location_id: 1, slot_number: 'A-01', vehicle_type: 'FOUR_WHEELER', status: 'AVAILABLE', hourly_price: 12.00, daily_price: 65.00, monthly_price: 350.00, dimensions: '2.5m x 5.0m' },
  { id: 102, location_id: 1, slot_number: 'A-02', vehicle_type: 'FOUR_WHEELER', status: 'OCCUPIED', hourly_price: 12.00, daily_price: 65.00, monthly_price: 350.00, dimensions: '2.5m x 5.0m' },
  { id: 103, location_id: 1, slot_number: 'A-03', vehicle_type: 'TWO_WHEELER', status: 'AVAILABLE', hourly_price: 5.00, daily_price: 25.00, monthly_price: 140.00, dimensions: '1.2m x 2.2m' },
  { id: 104, location_id: 1, slot_number: 'A-04', vehicle_type: 'FOUR_WHEELER', status: 'RESERVED', hourly_price: 15.00, daily_price: 80.00, monthly_price: 420.00, dimensions: '2.8m x 5.5m' },
  { id: 105, location_id: 1, slot_number: 'B-01', vehicle_type: 'FOUR_WHEELER', status: 'AVAILABLE', hourly_price: 12.00, daily_price: 65.00, monthly_price: 350.00, dimensions: '2.5m x 5.0m' },
  { id: 106, location_id: 1, slot_number: 'B-02', vehicle_type: 'TWO_WHEELER', status: 'AVAILABLE', hourly_price: 5.00, daily_price: 25.00, monthly_price: 140.00, dimensions: '1.2m x 2.2m' },

  { id: 201, location_id: 2, slot_number: 'C-01', vehicle_type: 'FOUR_WHEELER', status: 'AVAILABLE', hourly_price: 10.00, daily_price: 50.00, monthly_price: 300.00, dimensions: '2.5m x 5.0m' },
  { id: 202, location_id: 2, slot_number: 'C-02', vehicle_type: 'FOUR_WHEELER', status: 'OCCUPIED', hourly_price: 10.00, daily_price: 50.00, monthly_price: 300.00, dimensions: '2.5m x 5.0m' },
  { id: 203, location_id: 2, slot_number: 'C-03', vehicle_type: 'TWO_WHEELER', status: 'AVAILABLE', hourly_price: 4.00, daily_price: 20.00, monthly_price: 110.00, dimensions: '1.2m x 2.2m' },

  { id: 301, location_id: 3, slot_number: 'T-10', vehicle_type: 'FOUR_WHEELER', status: 'AVAILABLE', hourly_price: 8.50, daily_price: 45.00, monthly_price: 260.00, dimensions: '2.5m x 5.0m' },
  { id: 302, location_id: 3, slot_number: 'T-11', vehicle_type: 'TWO_WHEELER', status: 'AVAILABLE', hourly_price: 3.50, daily_price: 18.00, monthly_price: 95.00, dimensions: '1.2m x 2.2m' },

  { id: 401, location_id: 4, slot_number: 'H-01', vehicle_type: 'FOUR_WHEELER', status: 'AVAILABLE', hourly_price: 14.00, daily_price: 75.00, monthly_price: 400.00, dimensions: '2.8m x 5.5m' },
  { id: 402, location_id: 4, slot_number: 'H-02', vehicle_type: 'FOUR_WHEELER', status: 'MAINTENANCE', hourly_price: 14.00, daily_price: 75.00, monthly_price: 400.00, dimensions: '2.8m x 5.5m' }
];

let mockVehicles = [
  { id: 1, user_id: 1, vehicle_number: 'NY-PX-8890', vehicle_type: 'FOUR_WHEELER', brand: 'Porsche', model: 'Taycan Turbo S' },
  { id: 2, user_id: 1, vehicle_number: 'NY-MC-4412', vehicle_type: 'TWO_WHEELER', brand: 'BMW', model: 'R 1250 GS' },
  { id: 3, user_id: 2, vehicle_number: 'CA-AD-9901', vehicle_type: 'FOUR_WHEELER', brand: 'Tesla', model: 'Model S Plaid' }
];

let mockBookings = [
  {
    id: 1001,
    user_id: 1,
    vehicle_id: 1,
    slot_id: 102,
    location_name: 'Apex Grand Tower Garage',
    parking_name: 'Apex Grand Tower Garage',
    parking_location: 'Apex Grand Tower Garage',
    slot_number: 'A-02',
    vehicle_number: 'NY-PX-8890',
    full_name: 'Alex Mercer',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 7200000).toISOString(),
    booking_status: 'CONFIRMED',
    total_amount: 36.00,
    created_at: new Date(Date.now() - 4000000).toISOString()
  },
  {
    id: 1002,
    user_id: 1,
    vehicle_id: 2,
    slot_id: 103,
    location_name: 'Apex Grand Tower Garage',
    parking_name: 'Apex Grand Tower Garage',
    parking_location: 'Apex Grand Tower Garage',
    slot_number: 'A-03',
    vehicle_number: 'NY-MC-4412',
    full_name: 'Alex Mercer',
    start_time: new Date(Date.now() - 86400000).toISOString(),
    end_time: new Date(Date.now() - 79200000).toISOString(),
    booking_status: 'COMPLETED',
    total_amount: 10.00,
    created_at: new Date(Date.now() - 90000000).toISOString()
  },
  {
    id: 1003,
    user_id: 1,
    vehicle_id: 1,
    slot_id: 301,
    location_name: 'Silicon Hub Tech Park',
    parking_name: 'Silicon Hub Tech Park',
    parking_location: 'Silicon Hub Tech Park',
    slot_number: 'T-10',
    vehicle_number: 'NY-PX-8890',
    full_name: 'Alex Mercer',
    start_time: new Date(Date.now() + 3600000).toISOString(),
    end_time: new Date(Date.now() + 10800000).toISOString(),
    booking_status: 'PENDING',
    total_amount: 17.00,
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];

let mockSessions = [
  {
    id: 501,
    booking_id: 1001,
    slot_id: 102,
    entry_time: new Date(Date.now() - 3200000).toISOString(),
    exit_time: null,
    parking_fee: 36.00
  },
  {
    id: 502,
    booking_id: 1002,
    slot_id: 103,
    entry_time: new Date(Date.now() - 86400000).toISOString(),
    exit_time: new Date(Date.now() - 79200000).toISOString(),
    parking_fee: 10.00
  }
];

let mockUsers = [
  { id: 1, full_name: 'Alex Mercer', email: 'alex.driver@parkx.io', phone: '+1 555-0199', password: 'password', role: 'DRIVER', is_verified: true, status: 'ACTIVE' },
  { id: 2, full_name: 'Samantha Vance', email: 'admin.system@parkx.io', phone: '+1 555-9000', password: 'password', role: 'ADMIN', is_verified: true, status: 'ACTIVE' },
  { id: 3, full_name: 'David Miller', email: 'david.owner@parkx.io', phone: '+1 555-3344', password: 'password', role: 'OWNER', is_verified: true, status: 'ACTIVE' }
];

let mockNotifications = [
  { id: 1, user_id: 1, title: 'Booking Confirmed!', message: 'Your parking slot A-02 at Apex Grand Tower Garage is reserved.', notification_type: 'BOOKING_CONFIRMED', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, user_id: 1, title: 'Welcome to PARK-X', message: 'Explore nearby parking locations and reserve your spot in advance.', notification_type: 'VERIFICATION_STATUS', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, user_id: 3, title: 'New Booking Request', message: 'Driver Alex Mercer requested slot T-10 at Silicon Hub Tech Park.', notification_type: 'REMINDER', is_read: false, created_at: new Date(Date.now() - 600000).toISOString() }
];

let mockDisputes = [
  { id: 1, booking_id: 1002, user_id: 1, user_name: 'Alex Mercer', user_email: 'alex.driver@parkx.io', location_name: 'Apex Grand Tower Garage', reason: 'Incorrect Hourly Fee Charged', description: 'Charged $10 instead of $8.50 promo rate.', status: 'OPEN', created_at: new Date(Date.now() - 40000000).toISOString() }
];

let mockSettings = [
  { setting_key: 'PLATFORM_COMMISSION_PERCENT', value: '10', description: 'Platform fee percentage deducted from owner bookings.' },
  { setting_key: 'CANCELLATION_PENALTY_HOURS', value: '2', description: 'Free cancellation window prior to start time.' },
  { setting_key: 'SURGE_PRICING_ENABLED', value: 'TRUE', description: 'Enable dynamic surge multiplier during peak hours.' }
];

// Helper to make API requests with graceful fallback

async function apiFetch(endpoint, options = {}) {
    try {
        const token = localStorage.getItem("parkx_token");

        console.log("token : ", token);

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",

                ...(token && {
                    Authorization: `Bearer ${token}`
                }),

                ...options.headers
            }
        });

        if (res.ok) {
            return await res.json();
        }

        return null;

    } catch (err) {
        console.log(
            `Backend endpoint ${endpoint} offline/unavailable, serving fallback mock data.`
        );
        return null;
    }
}

export const apiService = {

  // 1. USER ENDPOINTS
  getAllUsers: async () => {
    const data = await apiFetch('/user');
    if (data && Array.isArray(data)) return data;
    return mockUsers;
  },

  getUserById: async (id) => {
    const data = await apiFetch(`/user/${id}`);
    if (data) return data;
    return mockUsers.find(u => u.id === Number(id));
  },

  createUser: async (userData) => {
    const data = await apiFetch('/create_user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data) return data;

    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      is_verified: userData.role === 'OWNER' ? false : true,
      status: 'ACTIVE'
    };
    mockUsers.unshift(newUser);
    return newUser;
  },

  loginUser: async (credentials) => {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data && data.user) return data.user;

    const user = mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password);
    if (user) return user;
    
    // Fallback default mock user matching requested role or credentials
    return {
      id: 1,
      full_name: 'Alex Mercer',
      email: credentials.email,
      phone: '+1 555-0199',
      role: credentials.role || 'DRIVER',
      is_verified: true,
      status: 'ACTIVE'
    };
  },

  updateUserStatus: async (id, status) => {
    const data = await apiFetch(`/user/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const u = mockUsers.find(x => x.id === Number(id));
    if (u) u.status = status;
    return data || u;
  },

  verifyUser: async (id, is_verified) => {
    const data = await apiFetch(`/user/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified })
    });
    const u = mockUsers.find(x => x.id === Number(id));
    if (u) u.is_verified = is_verified;
    return data || u;
  },

  updateUser: async (id, userData) => {
    const data = await apiFetch(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    const u = mockUsers.find(x => x.id === Number(id));
    if (u) Object.assign(u, userData);
    return data || u;
  },

  deleteUser: async (id) => {
    const data = await apiFetch(`/user/${id}`, { method: 'DELETE' });
    mockUsers = mockUsers.filter(x => x.id !== Number(id));
    return data || { success: true };
  },


  // 2. LOCATION ENDPOINTS


  getLocations: async () => {
    const data = await apiFetch('/location');
    if (data && Array.isArray(data) && data.length > 0) return data;
    return mockLocations;
  },

  getLocationById: async (id)=> {
      try{

        const data = await apiFetch(`/location/${id}`);

        return data;

      }catch(err){
        return err;
      }
  },

  getLocationsByOwner: async (ownerId) => {
    const data = await apiFetch(`/location/owner/${ownerId}`);
    if (data && Array.isArray(data)) return data;
    return mockLocations.filter(l => l.owner_id === Number(ownerId));
  },

  searchLocations: async (filters) => {
    const data = await apiFetch('/location/search', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    if (data && Array.isArray(data)) return data;

    return mockLocations.filter(l => {
      let match = true;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        match = match && (l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q));
      }
      return match;
    });
  },

  checkAvailability: async (locationData) => {
    const payload = {
      slot_id: Number(locationData.slot_id || locationData.slotId),
      start_time: locationData.start_time || locationData.startIso,
      end_time: locationData.end_time || locationData.endIso
    };

    const res = await apiFetch('/booking/availability', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res) return res;

    // Fallback local check
    const overlap = mockBookings.some(b => 
      b.slot_id === payload.slot_id &&
      ['PENDING', 'CONFIRMED', 'BLOCKED'].includes(b.booking_status) &&
      new Date(b.start_time) < new Date(payload.end_time) &&
      new Date(b.end_time) > new Date(payload.start_time)
    );

    return { available: !overlap, message: overlap ? "Slot is not available for requested timeframe." : "Slot is available." };
  },

  createLocation: async (locationData) => {
    const payload = {
      owner_id: locationData.owner_id || 1,
      name: locationData.name,
      address: locationData.address,
      longitude: Number(locationData.longitude) || -74.0060,
      latitude: Number(locationData.latitude) || 40.7128,
      total_slots: Number(locationData.total_slots) || 20,
      operating_hours_start: locationData.operating_hours_start || '06:00:00',
      operating_hours_end: locationData.operating_hours_end || '23:59:59',
      approval_mode: locationData.approval_mode || 'AUTO',
      description: locationData.description || '',
      image_url: locationData.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000'
    };

    const data = await apiFetch('/location/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data) return data;

    const newLoc = {
      id: mockLocations.length + 1,
      ...payload,
      is_verified: true,
      primary_image: payload.image_url
    };
    mockLocations.push(newLoc);
    return newLoc;
  },

  updateLocation: async (id, updateData) => {
    const data = await apiFetch(`/location/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    const loc = mockLocations.find(l => l.id === Number(id));
    if (loc) Object.assign(loc, updateData);
    return data || loc;
  },

  verifyLocation: async (id, is_verified) => {
    const data = await apiFetch(`/location/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified })
    });
    const loc = mockLocations.find(l => l.id === Number(id));
    if (loc) loc.is_verified = is_verified;
    return data || loc;
  },

  deleteLocation: async (id) => {
    const data = await apiFetch(`/location/${id}`, { method: 'DELETE' });
    mockLocations = mockLocations.filter(l => l.id !== Number(id));
    return data || { success: true };
  },

  // 3. SLOT ENDPOINTS
  getAllSlots: async () => {
    const data = await apiFetch('/slot');
    if (data && Array.isArray(data)) return data;
    return mockSlots;
  },

  getSlotById: async (id) => {
    const data = await apiFetch(`/slot/${id}`);
    if (data) return data;
    return mockSlots.find(s => s.id === Number(id));
  },

  getSlotsByLocation: async (locationId) => {
    const data = await apiFetch(`/slot/location/${locationId}`);
    if (data && Array.isArray(data)) return data;
    return mockSlots.filter(s => s.location_id === Number(locationId));
  },

  getAvailableSlots: async (locationId) => {
    const data = await apiFetch(`/slot/location/${locationId}/available`);
    if (data && Array.isArray(data)) return data;
    return mockSlots.filter(s => s.location_id === Number(locationId) && s.status === 'AVAILABLE');
  },

  getOccupiedSlots: async (locationId) => {
    const data = await apiFetch(`/slot/location/${locationId}/occupied`);
    if (data && Array.isArray(data)) return data;
    return mockSlots.filter(s => s.location_id === Number(locationId) && s.status === 'OCCUPIED');
  },

  getSlotStatistics: async (locationId) => {
    const data = await apiFetch(`/slot/location/${locationId}/stats`);
    if (data) return data;
    const slots = mockSlots.filter(s => s.location_id === Number(locationId));
    return {
      total: slots.length,
      available: slots.filter(s => s.status === 'AVAILABLE').length,
      occupied: slots.filter(s => s.status === 'OCCUPIED').length,
      reserved: slots.filter(s => s.status === 'RESERVED').length,
      maintenance: slots.filter(s => s.status === 'MAINTENANCE').length
    };
  },

  createSlot: async (slotData) => {
    const payload = {
      location_id: Number(slotData.location_id),
      slot_number: slotData.slot_number,
      vehicle_type: slotData.vehicle_type || 'FOUR_WHEELER',
      status: slotData.status || 'AVAILABLE',
      dimensions: slotData.dimensions || '2.5m x 5.0m',
      hourly_price: Number(slotData.hourly_price) || 12.00,
      daily_price: Number(slotData.daily_price) || 65.00,
      monthly_price: Number(slotData.monthly_price) || 350.00
    };

    const data = await apiFetch('/slot', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data) return data;

    const newSlot = {
      id: Math.floor(Math.random() * 9000) + 1000,
      ...payload
    };
    mockSlots.push(newSlot);
    return newSlot;
  },

  updateSlot: async (id, slotData) => {
    const data = await apiFetch(`/slot/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(slotData)
    });
    const slot = mockSlots.find(s => s.id === Number(id));
    if (slot) Object.assign(slot, slotData);
    return data || slot;
  },

  updateSlotStatus: async (slotId, status) => {
    const data = await apiFetch(`/slot/${slotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const slot = mockSlots.find(s => s.id === Number(slotId));
    if (slot) slot.status = status;
    return data?.slot || slot;
  },

  deleteSlot: async (slotId) => {
    const data = await apiFetch(`/slot/${slotId}`, { method: 'DELETE' });
    mockSlots = mockSlots.filter(s => s.id !== Number(slotId));
    return data || { success: true };
  },

  // 4. VEHICLE ENDPOINTS
  getAllVehicles: async () => {
    const data = await apiFetch('/vehicle');
    if (data && Array.isArray(data)) return data;
    return mockVehicles;
  },

  getVehicleById: async (id) => {
    const data = await apiFetch(`/vehicle/${id}`);
    if (data) return data;
    return mockVehicles.find(v => v.id === Number(id));
  },

  getVehiclesByUser: async (userId) => {
    const data = await apiFetch(`/vehicle/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockVehicles.filter(v => v.user_id === Number(userId));
  },

  createVehicle: async (vehicleData) => {
    const payload = {
      user_id: Number(vehicleData.user_id) || 1,
      vehicle_number: vehicleData.vehicle_number,
      vehicle_type: vehicleData.vehicle_type || 'FOUR_WHEELER',
      brand: vehicleData.brand || '',
      model: vehicleData.model || ''
    };

    const data = await apiFetch('/vehicle', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data) return data;

    const newV = {
      id: mockVehicles.length + 1,
      ...payload
    };
    mockVehicles.push(newV);
    return newV;
  },

  updateVehicle: async (id, vehicleData) => {
    const data = await apiFetch(`/vehicle/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(vehicleData)
    });
    const v = mockVehicles.find(x => x.id === Number(id));
    if (v) Object.assign(v, vehicleData);
    return data || v;
  },

  deleteVehicle: async (id) => {
    const data = await apiFetch(`/vehicle/${id}`, { method: 'DELETE' });
    mockVehicles = mockVehicles.filter(v => v.id !== Number(id));
    return data || { success: true };
  },


  // 5. BOOKING ENDPOINTS
  getAllBookings: async () => {
    const data = await apiFetch('/booking');
    if (data && Array.isArray(data)) return data;
    return mockBookings;
  },

  getBookingById: async (id) => {
    const data = await apiFetch(`/booking/${id}`);
    if (data) return data;
    return mockBookings.find(b => b.id === Number(id));
  },

  getBookingsByUser: async (userId) => {
    const data = await apiFetch(`/booking/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockBookings.filter(b => b.user_id === Number(userId));
  },

  getBookingsByOwner: async (ownerId) => {
    const data = await apiFetch(`/booking/owner/${ownerId}`);
    if (data && Array.isArray(data)) return data;
    return mockBookings;
  },

  getOwnerEarnings: async (ownerId) => {
    const data = await apiFetch(`/booking/owner/earnings/${ownerId}`);
    if (data && data.stats) return data;

    const totalRev = mockBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    return {
      stats: {
        total_earnings: totalRev,
        total_bookings: mockBookings.length,
        completed_bookings: mockBookings.filter(b => b.booking_status === 'COMPLETED').length,
        pending_approvals: mockBookings.filter(b => b.booking_status === 'PENDING').length
      },
      location_breakdown: mockLocations.map(l => ({ location_id: l.id, location_name: l.name, revenue: totalRev / mockLocations.length }))
    };
  },

  createBooking: async (bookingData) => {
    const payload = {
      user_id: Number(bookingData.user_id),
      vehicle_id: Number(bookingData.vehicle_id),
      slot_id: Number(bookingData.slot_id),
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      total_amount: Number(bookingData.total_amount)
    };

    const data = await apiFetch('/booking', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data && data.booking) return data.booking;

    const slot = mockSlots.find(s => s.id === payload.slot_id);
    const loc = mockLocations.find(l => l.id === slot?.location_id);
    const initialStatus = (loc?.approval_mode === 'MANUAL') ? 'PENDING' : 'CONFIRMED';

    if (slot && initialStatus === 'CONFIRMED') slot.status = 'RESERVED';

    const newBooking = {
      id: Math.floor(Math.random() * 9000) + 1000,
      user_id: payload.user_id,
      vehicle_id: payload.vehicle_id,
      slot_id: payload.slot_id,
      location_name: loc ? loc.name : 'Central Garage',
      parking_name: loc ? loc.name : 'Central Garage',
      slot_number: slot ? slot.slot_number : 'A-01',
      vehicle_number: 'NY-PX-8890',
      start_time: payload.start_time,
      end_time: payload.end_time,
      booking_status: initialStatus,
      total_amount: payload.total_amount || 24.00,
      created_at: new Date().toISOString()
    };
    mockBookings.unshift(newBooking);
    return newBooking;
  },

  approveBooking: async (id) => {
    const data = await apiFetch(`/booking/${id}/approve`, { method: 'PATCH' });
    const b = mockBookings.find(x => x.id === Number(id));
    if (b) b.booking_status = 'CONFIRMED';
    return data || b;
  },

  rejectBooking: async (id) => {
    const data = await apiFetch(`/booking/${id}/reject`, { method: 'PATCH' });
    const b = mockBookings.find(x => x.id === Number(id));
    if (b) b.booking_status = 'CANCELLED';
    return data || b;
  },

  blockSlotTimeframe: async (slot_id, start_time, end_time, owner_id) => {
    const data = await apiFetch('/booking/block', {
      method: 'POST',
      body: JSON.stringify({ slot_id, start_time, end_time, owner_id })
    });
    if (data) return data;

    const blocked = {
      id: Math.floor(Math.random() * 9000) + 1000,
      slot_id: Number(slot_id),
      user_id: owner_id || 3,
      start_time,
      end_time,
      booking_status: 'BLOCKED',
      total_amount: 0.00
    };
    mockBookings.unshift(blocked);
    return blocked;
  },

  cancelBooking: async (bookingId, cancelledBy = 1) => {
    const data = await apiFetch(`/booking/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancelled_by: Number(cancelledBy) })
    });
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) b.booking_status = 'CANCELLED';
    return data || { success: true };
  },

  checkIn: async (bookingId) => {
    const data = await apiFetch(`/booking/${bookingId}/checkin`, { method: 'POST' });
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) b.booking_status = 'ACTIVE';
    return data || { success: true };
  },

  checkOut: async (bookingId) => {
    const data = await apiFetch(`/booking/${bookingId}/checkout`, { method: 'POST' });
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) b.booking_status = 'COMPLETED';
    return data || { success: true };
  },

  // 6. NOTIFICATIONS ENDPOINTS
  getNotifications: async (userId) => {
    const data = await apiFetch(`/notification/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockNotifications.filter(n => n.user_id === Number(userId));
  },

  createNotification: async (notificationData) => {
    const data = await apiFetch('/notification', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
    if (data) return data;
    const newN = {
      id: mockNotifications.length + 1,
      ...notificationData,
      is_read: false,
      created_at: new Date().toISOString()
    };
    mockNotifications.unshift(newN);
    return newN;
  },

  markNotificationRead: async (id) => {
    const data = await apiFetch(`/notification/${id}/read`, { method: 'PATCH' });
    const n = mockNotifications.find(x => x.id === Number(id));
    if (n) n.is_read = true;
    return data || n;
  },

  markAllNotificationsRead: async (userId) => {
    const data = await apiFetch(`/notification/user/${userId}/read-all`, { method: 'PATCH' });
    mockNotifications.forEach(n => { if (n.user_id === Number(userId)) n.is_read = true; });
    return data || { success: true };
  },

  // 7. DISPUTES ENDPOINTS
  getAllDisputes: async () => {
    const data = await apiFetch('/dispute');
    if (data && Array.isArray(data)) return data;
    return mockDisputes;
  },

  getDisputesByUser: async (userId) => {
    const data = await apiFetch(`/dispute/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockDisputes.filter(d => d.user_id === Number(userId));
  },

  createDispute: async (disputeData) => {
    const data = await apiFetch('/dispute', {
      method: 'POST',
      body: JSON.stringify(disputeData)
    });
    if (data) return data;

    const newD = {
      id: mockDisputes.length + 1,
      ...disputeData,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };
    mockDisputes.unshift(newD);
    return newD;
  },

  updateDisputeStatus: async (id, status) => {
    const data = await apiFetch(`/dispute/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const d = mockDisputes.find(x => x.id === Number(id));
    if (d) d.status = status;
    return data || d;
  },

  // 8. SYSTEM SETTINGS & ADMIN STATS ENDPOINTS
  getSettings: async () => {
    const data = await apiFetch('/setting');
    if (data && Array.isArray(data)) return data;
    return mockSettings;
  },

  updateSetting: async (key, value, description) => {
    const data = await apiFetch(`/setting/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description })
    });
    const s = mockSettings.find(x => x.setting_key === key);
    if (s) {
      s.value = value;
      if (description) s.description = description;
    }
    return data || s;
  },

  getAdminStats: async () => {
    const data = await apiFetch('/setting/stats');
    if (data && data.total_revenue !== undefined) return data;

    const totalRev = mockBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    return {
      total_revenue: totalRev,
      total_bookings: mockBookings.length,
      pending_bookings: mockBookings.filter(b => b.booking_status === 'PENDING').length,
      active_sessions: mockSessions.filter(s => !s.exit_time).length,
      total_users: mockUsers.length,
      owner_count: mockUsers.filter(u => u.role === 'OWNER').length,
      driver_count: mockUsers.filter(u => u.role === 'DRIVER').length,
      total_locations: mockLocations.length,
      verified_locations: mockLocations.filter(l => l.is_verified).length,
      open_disputes: mockDisputes.filter(d => d.status === 'OPEN').length
    };
  },

  // 9. SESSIONS ENDPOINTS
  getAllSessions: async () => {
    const data = await apiFetch('/sessions');
    if (data && Array.isArray(data)) return data;
    return mockSessions;
  }
};

