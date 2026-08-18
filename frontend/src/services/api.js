
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

if (!BASE_URL) {
  console.error(
    "VITE_API_URL is not configured. Please add VITE_API_URL to your Vercel environment variables."
  );
}

/**
 * Centralized API request helper.
 *
 * IMPORTANT:
 * - Never returns mock/fallback data.
 * - Throws on network errors.
 * - Throws on non-2xx HTTP responses.
 * - Automatically attaches JWT when available.
 */
async function apiFetch(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new Error(
      "API configuration error: VITE_API_URL is not configured."
    );
  }

  const token = localStorage.getItem("parkx_token");

  const url = `${BASE_URL}${endpoint}`;

  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...(token && {
          Authorization: `Bearer ${token}`,
        }),

        ...options.headers,
      },
    });

    // Handle 204 No Content
    if (res.status === 204) {
      return null;
    }

    // Try to parse JSON response
    const contentType = res.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = text || null;
    }

    // Handle HTTP errors
    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.details ||
        (typeof data === "string" ? data : null) ||
        `Request failed with status ${res.status}`;

      const error = new Error(message);

      // Attach useful information for frontend error handling
      error.status = res.status;
      error.data = data;
      error.endpoint = endpoint;

      // Automatically clear invalid authentication
      if (res.status === 401) {
        localStorage.removeItem("parkx_token");
        localStorage.removeItem("parkx_user");
      }

      throw error;
    }

    return data;
  } catch (err) {
    // Preserve our own HTTP errors
    if (err.status) {
      throw err;
    }

    // Network / CORS / connection errors
    const networkError = new Error(
      `Unable to connect to the backend. Please check the server and network connection.`
    );

    networkError.status = 0;
    networkError.cause = err;
    networkError.endpoint = endpoint;

    console.error(`[API NETWORK ERROR] ${url}`, err);

    throw networkError;
  }
}

export const apiService = {
  // ============================================================
  // 1. USER ENDPOINTS
  // ============================================================

  getAllUsers: async () => {
    return await apiFetch("/user");
  },

  getUserById: async (id) => {
    return await apiFetch(`/user/${id}`);
  },

  createUser: async (userData) => {
    if (userData.role === "ADMIN") {
      throw new Error(
        "Registration as ADMIN is not allowed. System Administrator is a restricted account."
      );
    }

    return await apiFetch("/create_user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  loginUser: async (credentials) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!data) {
      throw new Error("Login failed: empty response from server.");
    }

    return data;
  },

  updateUserStatus: async (id, status) => {
    return await apiFetch(`/user/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  verifyUser: async (id, is_verified) => {
    return await apiFetch(`/user/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified }),
    });
  },

  updateUser: async (id, userData) => {
    return await apiFetch(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return await apiFetch(`/user/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 2. LOCATION ENDPOINTS
  // ============================================================

  getLocations: async () => {
    return await apiFetch("/location");
  },

  getLocationById: async (id) => {
    return await apiFetch(`/location/${id}`);
  },

  getLocationsByOwner: async (ownerId) => {
    return await apiFetch(`/location/owner/${ownerId}`);
  },

  searchLocations: async (filters) => {
    return await apiFetch("/location/search", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  },

  checkAvailability: async (locationData) => {
    const payload = {
      slot_id: Number(locationData.slot_id || locationData.slotId),
      start_time: locationData.start_time || locationData.startIso,
      end_time: locationData.end_time || locationData.endIso,
    };

    return await apiFetch("/booking/availability", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createLocation: async (locationData) => {
    const payload = {
      owner_id: Number(locationData.owner_id),
      name: locationData.name,
      address: locationData.address,
      longitude: Number(locationData.longitude),
      latitude: Number(locationData.latitude),
      total_slots: Number(locationData.total_slots),
      operating_hours_start: locationData.operating_hours_start,
      operating_hours_end: locationData.operating_hours_end,
      approval_mode: locationData.approval_mode || "AUTO",
      description: locationData.description || "",
      image_url: locationData.image_url || "",
    };

    return await apiFetch("/location/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateLocation: async (id, updateData) => {
    return await apiFetch(`/location/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  },

  verifyLocation: async (id, is_verified) => {
    return await apiFetch(`/location/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified }),
    });
  },

  deleteLocation: async (id) => {
    return await apiFetch(`/location/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 3. SLOT ENDPOINTS
  // ============================================================

  getAllSlots: async () => {
    return await apiFetch("/slot");
  },

  getSlotById: async (id) => {
    return await apiFetch(`/slot/${id}`);
  },

  getSlotsByLocation: async (locationId) => {
    return await apiFetch(`/slot/location/${locationId}`);
  },

  getAvailableSlots: async (locationId) => {
    return await apiFetch(`/slot/location/${locationId}/available`);
  },

  getOccupiedSlots: async (locationId) => {
    return await apiFetch(`/slot/location/${locationId}/occupied`);
  },

  getSlotStatistics: async (locationId) => {
    return await apiFetch(`/slot/location/${locationId}/stats`);
  },

  createSlot: async (slotData) => {
    const payload = {
      location_id: Number(slotData.location_id),
      slot_number: slotData.slot_number,
      vehicle_type: slotData.vehicle_type || "FOUR_WHEELER",
      status: slotData.status || "AVAILABLE",
      dimensions: slotData.dimensions || "2.5m x 5.0m",
      hourly_price: Number(slotData.hourly_price),
      daily_price: Number(slotData.daily_price),
      monthly_price: Number(slotData.monthly_price),
    };

    return await apiFetch("/slot", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateSlot: async (id, slotData) => {
    return await apiFetch(`/slot/${id}`, {
      method: "PATCH",
      body: JSON.stringify(slotData),
    });
  },

  updateSlotStatus: async (slotId, status) => {
    const data = await apiFetch(`/slot/${slotId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    return data?.slot ?? data;
  },

  deleteSlot: async (slotId) => {
    return await apiFetch(`/slot/${slotId}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 4. VEHICLE ENDPOINTS
  // ============================================================

  getAllVehicles: async () => {
    return await apiFetch("/vehicle");
  },

  getVehicleById: async (id) => {
    return await apiFetch(`/vehicle/${id}`);
  },

  getVehiclesByUser: async (userId) => {
    return await apiFetch(`/vehicle/user/${userId}`);
  },

  createVehicle: async (vehicleData) => {
    const payload = {
      user_id: Number(vehicleData.user_id),
      vehicle_number: vehicleData.vehicle_number,
      vehicle_type: vehicleData.vehicle_type || "FOUR_WHEELER",
      brand: vehicleData.brand || "",
      model: vehicleData.model || "",
    };

    return await apiFetch("/vehicle", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateVehicle: async (id, vehicleData) => {
    return await apiFetch(`/vehicle/${id}`, {
      method: "PATCH",
      body: JSON.stringify(vehicleData),
    });
  },

  deleteVehicle: async (id) => {
    return await apiFetch(`/vehicle/${id}`, {
      method: "DELETE",
    });
  },

  // ============================================================
  // 5. BOOKING ENDPOINTS
  // ============================================================

  getAllBookings: async () => {
    return await apiFetch("/booking");
  },

  getBookingById: async (id) => {
    return await apiFetch(`/booking/${id}`);
  },

  getBookingsByUser: async (userId) => {
    return await apiFetch(`/booking/user/${userId}`);
  },

  getBookingsByOwner: async (ownerId) => {
    return await apiFetch(`/booking/owner/${ownerId}`);
  },

  getOwnerEarnings: async (ownerId) => {
    return await apiFetch(`/booking/owner/earnings/${ownerId}`);
  },

  createBooking: async (bookingData) => {
    const payload = {
      user_id: Number(bookingData.user_id),
      vehicle_id: Number(bookingData.vehicle_id),
      slot_id: Number(bookingData.slot_id),
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      total_amount: Number(bookingData.total_amount),
    };

    const data = await apiFetch("/booking", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return data?.booking ?? data;
  },

  approveBooking: async (id) => {
    return await apiFetch(`/booking/${id}/approve`, {
      method: "PATCH",
    });
  },

  rejectBooking: async (id) => {
    return await apiFetch(`/booking/${id}/reject`, {
      method: "PATCH",
    });
  },

  blockSlotTimeframe: async (
    slot_id,
    start_time,
    end_time,
    owner_id
  ) => {
    return await apiFetch("/booking/block", {
      method: "POST",
      body: JSON.stringify({
        slot_id,
        start_time,
        end_time,
        owner_id,
      }),
    });
  },

  cancelBooking: async (bookingId, cancelledBy = 1) => {
    return await apiFetch(`/booking/${bookingId}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({
        cancelled_by: Number(cancelledBy),
      }),
    });
  },

  checkIn: async (bookingId) => {
    return await apiFetch(`/booking/${bookingId}/checkin`, {
      method: "POST",
    });
  },

  checkOut: async (bookingId) => {
    return await apiFetch(`/booking/${bookingId}/checkout`, {
      method: "POST",
    });
  },

  // ============================================================
  // 6. NOTIFICATION ENDPOINTS
  // ============================================================

  getNotifications: async (userId) => {
    return await apiFetch(`/notification/user/${userId}`);
  },

  createNotification: async (notificationData) => {
    return await apiFetch("/notification", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  },

  markNotificationRead: async (id) => {
    return await apiFetch(`/notification/${id}/read`, {
      method: "PATCH",
    });
  },

  markAllNotificationsRead: async (userId) => {
    return await apiFetch(`/notification/user/${userId}/read-all`, {
      method: "PATCH",
    });
  },

  // ============================================================
  // 7. DISPUTE ENDPOINTS
  // ============================================================

  getAllDisputes: async () => {
    return await apiFetch("/dispute");
  },

  getDisputesByUser: async (userId) => {
    return await apiFetch(`/dispute/user/${userId}`);
  },

  createDispute: async (disputeData) => {
    return await apiFetch("/dispute", {
      method: "POST",
      body: JSON.stringify(disputeData),
    });
  },

  updateDisputeStatus: async (id, status) => {
    return await apiFetch(`/dispute/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // ============================================================
  // 8. SYSTEM SETTINGS & ADMIN STATS
  // ============================================================

  getSettings: async () => {
    return await apiFetch("/setting");
  },

  updateSetting: async (key, value, description) => {
    return await apiFetch(`/setting/${key}`, {
      method: "PUT",
      body: JSON.stringify({
        value,
        description,
      }),
    });
  },

  getAdminStats: async () => {
    return await apiFetch("/setting/stats");
  },

  // ============================================================
  // 9. SESSIONS ENDPOINTS
  // ============================================================

  getAllSessions: async () => {
    return await apiFetch("/sessions");
  },
};