// Centralized API Service for PARK-X Smart Parking System
// Synchronized with Backend Routes: /user, /location, /slot, /vehicle, /booking, /sessions

const BASE_URL = 'http://localhost:8080';

// Fallback Mock Datasets (guarantees a pristine UI even when backend is offline)
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
    description: 'Multi-level automated garage with EV charging, 24/7 CCTV, and valet service.'
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
    description: 'Prime city center parking with high-capacity SUV spaces and smart barrier entry.'
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
    description: 'Monitored tech park parking lot with covered slots and automated license plate recognition.'
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
    description: 'Spacious waterfront parking with security patrols and oversize vehicle support.'
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
  { id: 1, full_name: 'Alex Mercer', email: 'alex.driver@parkx.io', phone: '+1 555-0199', password: '••••••••', role: 'DRIVER', is_verified: true, status: 'ACTIVE' },
  { id: 2, full_name: 'Samantha Vance', email: 'admin.system@parkx.io', phone: '+1 555-9000', password: '••••••••', role: 'ADMIN', is_verified: true, status: 'ACTIVE' },
  { id: 3, full_name: 'David Miller', email: 'david.owner@parkx.io', phone: '+1 555-3344', password: '••••••••', role: 'OWNER', is_verified: true, status: 'ACTIVE' }
];

// Helper to make API requests with graceful fallback
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.log(`Backend endpoint ${endpoint} offline/unavailable, serving fallback mock data.`);
  }
  return null;
}

export const apiService = {
  // ================= USER ENDPOINTS (GET /user , POST /create_user) =================
  getAllUsers: async () => {
    const data = await apiFetch('/user');
    if (data && Array.isArray(data)) return data;
    return mockUsers;
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
      is_verified: userData.is_verified ?? true,
      status: 'ACTIVE'
    };
    mockUsers.unshift(newUser);
    return newUser;
  },

  // ================= LOCATION ENDPOINTS (/location) =================
  getLocations: async () => {
    const data = await apiFetch('/location');
    if (data && Array.isArray(data) && data.length > 0) return data;
    return mockLocations;
  },

  createLocation: async (locationData) => {
    const payload = {
      owner_id: locationData.owner_id || 3,
      name: locationData.name,
      address: locationData.address,
      longitude: Number(locationData.longitude) || -74.0060,
      latitude: Number(locationData.latitude) || 40.7128,
      total_slots: Number(locationData.total_slots) || 20
    };

    const data = await apiFetch('/location/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data) return data;

    const newLoc = {
      id: mockLocations.length + 1,
      ...locationData,
      owner_id: payload.owner_id,
      total_slots: payload.total_slots,
      latitude: payload.latitude,
      longitude: payload.longitude,
      is_verified: true,
      approval_mode: locationData.approval_mode || 'AUTO'
    };
    mockLocations.push(newLoc);
    return newLoc;
  },

  updateLocation: async (id, updateData) => {
    const data = await apiFetch(`/location/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    if (data) return data;

    const loc = mockLocations.find(l => l.id === Number(id));
    if (loc) {
      Object.assign(loc, updateData);
    }
    return loc;
  },

  deleteLocation: async (id) => {
    const data = await apiFetch(`/location/${id}`, { method: 'DELETE' });
    mockLocations = mockLocations.filter(l => l.id !== Number(id));
    return data || { success: true };
  },

  // ================= SLOT ENDPOINTS (/slot) =================
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

  getSlotStats: async (locationId) => {
    const data = await apiFetch(`/slot/location/${locationId}/stats`);
    if (data && data.total_slots !== undefined) return data;

    const slots = mockSlots.filter(s => s.location_id === Number(locationId));
    return {
      total_slots: slots.length,
      available_slots: slots.filter(s => s.status === 'AVAILABLE').length,
      occupied_slots: slots.filter(s => s.status === 'OCCUPIED').length,
      reserved_slots: slots.filter(s => s.status === 'RESERVED').length,
      maintenance_slots: slots.filter(s => s.status === 'MAINTENANCE').length
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
    if (data) return data;

    const slot = mockSlots.find(s => s.id === Number(id));
    if (slot) {
      Object.assign(slot, slotData);
    }
    return slot;
  },

  updateSlotStatus: async (slotId, status) => {
    const data = await apiFetch(`/slot/${slotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data && data.slot) return data.slot;
    if (data) return data;

    const slot = mockSlots.find(s => s.id === Number(slotId));
    if (slot) slot.status = status;
    return slot;
  },

  deleteSlot: async (slotId) => {
    const data = await apiFetch(`/slot/${slotId}`, { method: 'DELETE' });
    mockSlots = mockSlots.filter(s => s.id !== Number(slotId));
    return data || { success: true };
  },

  // ================= VEHICLE ENDPOINTS (/vehicle) =================
  getAllVehicles: async () => {
    const data = await apiFetch('/vehicle');
    if (data && Array.isArray(data)) return data;
    return mockVehicles;
  },

  getVehiclesByUser: async (userId) => {
    const data = await apiFetch(`/vehicle/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockVehicles.filter(v => v.user_id === Number(userId));
  },

  getVehicleById: async (id) => {
    const data = await apiFetch(`/vehicle/${id}`);
    if (data) return data;
    return mockVehicles.find(v => v.id === Number(id));
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

  deleteVehicle: async (id) => {
    const data = await apiFetch(`/vehicle/${id}`, { method: 'DELETE' });
    if (data && data.error) {
      return { success: false, error: data.error };
    }
    mockVehicles = mockVehicles.filter(v => v.id !== Number(id));
    return { success: true };
  },

  // ================= BOOKING ENDPOINTS (/booking) =================
  getAllBookings: async () => {
    const data = await apiFetch('/booking');
    if (data && Array.isArray(data)) return data;
    return mockBookings;
  },

  getBookingsByUser: async (userId) => {
    const data = await apiFetch(`/booking/user/${userId}`);
    if (data && Array.isArray(data)) return data;
    return mockBookings.filter(b => b.user_id === Number(userId));
  },

  getBookingById: async (id) => {
    const data = await apiFetch(`/booking/${id}`);
    if (data) return data;
    return mockBookings.find(b => b.id === Number(id));
  },

  checkAvailability: async (slotId, startTime, endTime) => {
    const data = await apiFetch('/booking/availability', {
      method: 'POST',
      body: JSON.stringify({ slot_id: Number(slotId), start_time: startTime, end_time: endTime })
    });
    if (data) return data;
    return { available: true, message: "Slot is available." };
  },

  createBooking: async (bookingData) => {
    const payload = {
      user_id: Number(bookingData.user_id) || 1,
      vehicle_id: Number(bookingData.vehicle_id) || 1,
      slot_id: Number(bookingData.slot_id),
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      total_amount: Number(bookingData.total_amount)
    };

    const data = await apiFetch('/booking', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    // Backend returns { message: "Booking Created Successfully", booking: { ... } }
    if (data && data.booking) {
      return data.booking;
    }
    if (data && data.id) {
      return data;
    }

    const slot = mockSlots.find(s => s.id === payload.slot_id);
    if (slot) slot.status = 'RESERVED';

    const loc = mockLocations.find(l => l.id === slot?.location_id);
    const vehicle = mockVehicles.find(v => v.id === payload.vehicle_id);

    const newBooking = {
      id: Math.floor(Math.random() * 9000) + 1000,
      user_id: payload.user_id,
      vehicle_id: payload.vehicle_id,
      slot_id: payload.slot_id,
      location_name: loc ? loc.name : 'Central Garage',
      parking_name: loc ? loc.name : 'Central Garage',
      slot_number: slot ? slot.slot_number : 'A-01',
      vehicle_number: vehicle ? vehicle.vehicle_number : 'NY-REG-100',
      start_time: payload.start_time || new Date().toISOString(),
      end_time: payload.end_time || new Date(Date.now() + 7200000).toISOString(),
      booking_status: 'CONFIRMED',
      total_amount: payload.total_amount || 24.00,
      created_at: new Date().toISOString()
    };
    mockBookings.unshift(newBooking);
    return newBooking;
  },

  cancelBooking: async (bookingId, cancelledBy = 1) => {
    const data = await apiFetch(`/booking/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancelled_by: Number(cancelledBy) })
    });
    
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) {
      b.booking_status = 'CANCELLED';
      const slot = mockSlots.find(s => s.id === b.slot_id);
      if (slot) slot.status = 'AVAILABLE';
    }
    return data || { success: true, message: "Booking cancelled successfully" };
  },

  checkIn: async (bookingId) => {
    const data = await apiFetch(`/booking/${bookingId}/checkin`, { method: 'POST' });
    
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) {
      b.booking_status = 'ACTIVE';
      const slot = mockSlots.find(s => s.id === b.slot_id);
      if (slot) slot.status = 'OCCUPIED';

      const existingSession = mockSessions.find(s => s.booking_id === b.id);
      if (!existingSession) {
        mockSessions.unshift({
          id: Math.floor(Math.random() * 9000) + 100,
          booking_id: b.id,
          slot_id: b.slot_id,
          entry_time: new Date().toISOString(),
          exit_time: null,
          parking_fee: b.total_amount
        });
      }
    }
    return data || { success: true, message: "Vehicle checked in successfully." };
  },

  checkOut: async (bookingId) => {
    const data = await apiFetch(`/booking/${bookingId}/checkout`, { method: 'POST' });
    
    const b = mockBookings.find(x => x.id === Number(bookingId));
    if (b) {
      b.booking_status = 'COMPLETED';
      const slot = mockSlots.find(s => s.id === b.slot_id);
      if (slot) slot.status = 'AVAILABLE';

      const session = mockSessions.find(s => s.booking_id === b.id);
      if (session) {
        session.exit_time = new Date().toISOString();
      }
    }
    return data || { success: true, message: "Checkout successful" };
  },

  // ================= SESSIONS ENDPOINTS (/sessions) =================
  getAllSessions: async () => {
    const data = await apiFetch('/sessions');
    if (data && Array.isArray(data)) return data;
    return mockSessions;
  }
};
