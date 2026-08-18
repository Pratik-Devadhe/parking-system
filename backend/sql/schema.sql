-- ==========================================
-- EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS postgis;    -- Geospatial search (nearest parking)
CREATE EXTENSION IF NOT EXISTS btree_gist; -- Required for exclusion constraints (booking overlap)

-- ==========================================
-- DROP TABLES IF THEY EXIST (Correct Syntax)
-- ==========================================
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS parking_sessions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_location_images CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;
DROP TABLE IF EXISTS parking_locations CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================
-- 1. USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('DRIVER','OWNER','ADMIN')),
    
    -- Verification and Account Status (Admin Requirements)
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. VEHICLES
-- =========================
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL
        CHECK(LENGTH(vehicle_number) >= 6), -- Minimum length for valid plate numbers
    vehicle_type VARCHAR(20) NOT NULL CHECK(vehicle_type IN ('TWO_WHEELER','FOUR_WHEELER')),
    brand VARCHAR(50),
    model VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- 3. PARKING LOCATIONS
-- =========================
CREATE TABLE IF NOT EXISTS parking_locations (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,

    -- Single source of truth for geolocation (PostGIS)
    location GEOGRAPHY(Point, 4326) NOT NULL,

    -- Generated columns derived from the geography point (read-only convenience)
    latitude  DECIMAL(10,8) GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
    longitude DECIMAL(11,8) GENERATED ALWAYS AS (ST_X(location::geometry)) STORED,

    description TEXT,
    
    -- Cache for total slots (to align with index.js code logic)
    total_slots INT DEFAULT 0,
    
    -- Operating Hours / Schedule
    operating_hours_start TIME DEFAULT '00:00:00',
    operating_hours_end TIME DEFAULT '23:59:59',
    
    -- Rules & Approval settings (extensible enum over boolean)
    approval_mode VARCHAR(20) DEFAULT 'AUTO'
        CHECK(approval_mode IN ('AUTO', 'MANUAL')),
    is_verified BOOLEAN DEFAULT FALSE, -- Admin verification status
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_location_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================
-- 4. PARKING LOCATION IMAGES (New Table)
-- =====================================
CREATE TABLE IF NOT EXISTS parking_location_images (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_image_location
        FOREIGN KEY(location_id)
        REFERENCES parking_locations(id)
        ON DELETE CASCADE
);

-- =========================
-- 5. PARKING SLOTS
-- =========================
CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL, -- NOT unique: many slots per location
    slot_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL
        CHECK(vehicle_type IN ('TWO_WHEELER','FOUR_WHEELER')),
    status VARCHAR(20) DEFAULT 'AVAILABLE'
        CHECK(status IN ('AVAILABLE','RESERVED','OCCUPIED','MAINTENANCE')),

    dimensions VARCHAR(50), -- Detailed size (e.g. "Compact", "SUV / Large")
    hourly_price DECIMAL(10,2) NOT NULL,
    daily_price DECIMAL(10,2),
    monthly_price DECIMAL(10,2),

    -- Price validity constraints
    CONSTRAINT chk_hourly_price CHECK (hourly_price > 0),
    CONSTRAINT chk_daily_price CHECK (daily_price IS NULL OR daily_price >= 0),
    CONSTRAINT chk_monthly_price CHECK (monthly_price IS NULL OR monthly_price >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Slot number must be unique WITHIN a location, not globally
    CONSTRAINT uq_slot_per_location UNIQUE (location_id, slot_number),

    CONSTRAINT fk_slot_location
        FOREIGN KEY(location_id)
        REFERENCES parking_locations(id)
        ON DELETE CASCADE
);

-- =========================
-- 6. BOOKINGS
-- =========================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    booking_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK(booking_status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','BLOCKED')),
        -- 'BLOCKED' used for owner blocking slot timeframes

    total_amount DECIMAL(10,2),

    -- Audit fields for cancellations
    cancelled_at TIMESTAMP,
    cancelled_by BIGINT, -- FK to users.id (who cancelled: user, owner, or admin)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Booking time validity: end must be after start
    CONSTRAINT chk_booking_time CHECK (end_time > start_time),

    CONSTRAINT fk_booking_user
        FOREIGN KEY(user_id)
        REFERENCES users(id),

    CONSTRAINT fk_booking_vehicle
        FOREIGN KEY(vehicle_id)
        REFERENCES vehicles(id),

    CONSTRAINT fk_booking_slot
        FOREIGN KEY(slot_id)
        REFERENCES parking_slots(id),

    CONSTRAINT fk_booking_cancelled_by
        FOREIGN KEY(cancelled_by)
        REFERENCES users(id),

    -- =====================================================
    -- BOOKING OVERLAP PROTECTION (Database-level guarantee)
    -- =====================================================
    -- Prevents any two active bookings from overlapping on
    -- the same slot. Uses tsrange exclusion via btree_gist.
    -- The backend MUST also validate before INSERT:
    --   SELECT * FROM bookings
    --   WHERE slot_id = $1
    --     AND booking_status IN ('CONFIRMED','PENDING')
    --     AND start_time < $newEnd
    --     AND end_time > $newStart;
    --   → If rows exist → REJECT booking.
    -- =====================================================
    CONSTRAINT no_booking_overlap
        EXCLUDE USING gist (
            slot_id WITH =,
            tsrange(start_time, end_time) WITH &&
        ) WHERE (booking_status IN ('PENDING', 'CONFIRMED', 'BLOCKED'))
);

-- =========================
-- 7. PARKING SESSIONS
-- =========================
CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    slot_id BIGINT NOT NULL,  -- Denormalized for faster reporting (avoids booking→slot join)
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    parking_fee DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Session time validity: exit must be at or after entry
    CONSTRAINT chk_session_time CHECK (
        exit_time IS NULL
        OR entry_time IS NULL
        OR exit_time >= entry_time
    ),

    CONSTRAINT fk_session_booking
        FOREIGN KEY(booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_session_slot
        FOREIGN KEY(slot_id)
        REFERENCES parking_slots(id)
);

-- =========================
-- 8. PAYMENTS
-- =========================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30),
    transaction_id VARCHAR(255),

    -- Payment gateway integration fields
    gateway_name VARCHAR(50),    -- e.g. 'Razorpay', 'Stripe', 'PayPal'
    gateway_response TEXT,       -- Raw JSON response from gateway

    payment_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK(payment_status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate gateway transactions
    CONSTRAINT uq_transaction_id UNIQUE(transaction_id),

    CONSTRAINT fk_payment_booking
        FOREIGN KEY(booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE
);

-- =========================
-- 9. NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50)
        CHECK(notification_type IN (
            'BOOKING_CONFIRMED',
            'BOOKING_CANCELLED',
            'PAYMENT_SUCCESS',
            'PAYMENT_FAILED',
            'REMINDER',
            'VERIFICATION_STATUS',
            'DISPUTE_UPDATE'
        )),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,  -- Tracks when email/SMS/push was actually dispatched
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ===================================
-- 10. DISPUTES (New Table for Admins)
-- ===================================
CREATE TABLE IF NOT EXISTS disputes (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,

    CONSTRAINT fk_dispute_booking
        FOREIGN KEY(booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_dispute_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ==============================================
-- 11. SYSTEM SETTINGS (New Table for Admin Rules)
-- ==============================================
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================
CREATE INDEX IF NOT EXISTS idx_vehicle_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_slot_location ON parking_slots(location_id);
CREATE INDEX IF NOT EXISTS idx_booking_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_payment_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_dispute_booking ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_slot ON parking_sessions(slot_id);

-- PostGIS spatial index for nearest-parking search
CREATE INDEX IF NOT EXISTS idx_location_geo ON parking_locations USING GIST (location);

-- Booking date range query speed (partial index on active bookings only)
CREATE INDEX IF NOT EXISTS idx_booking_timeframes ON bookings(slot_id, start_time, end_time) 
WHERE booking_status IN ('PENDING', 'CONFIRMED', 'BLOCKED');

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- =============================================
-- PostgreSQL does NOT auto-update updated_at.
-- This trigger handles it for all tables.
-- =============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to every table with updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_parking_locations_updated_at
    BEFORE UPDATE ON parking_locations
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_parking_location_images_updated_at
    BEFORE UPDATE ON parking_location_images
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_parking_slots_updated_at
    BEFORE UPDATE ON parking_slots
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_parking_sessions_updated_at
    BEFORE UPDATE ON parking_sessions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_disputes_updated_at
    BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();