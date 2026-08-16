import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import random

DB_CONFIG = {
    'dbname': 'parking_system',
    'user': 'postgres',
    'password': 'pratik',
    'host': 'localhost',
    'port': 5432
}

def create_connection():
    return psycopg2.connect(**DB_CONFIG)

def seed_data():
    conn = create_connection()
    conn.autocommit = False
    cur = conn.cursor()
    try:
        # Create Users
        print("Seeding Users...")
        cur.execute("INSERT INTO users (full_name, email, phone, password, role, is_verified, status) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (email) DO NOTHING RETURNING id",
                    ('Admin User', 'admin@example.com', '1234567890', 'hashed_pass', 'ADMIN', True, 'ACTIVE'))
        
        cur.execute("INSERT INTO users (full_name, email, phone, password, role, is_verified, status) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id",
                    ('Owner One', 'owner1@example.com', '1112223333', 'hashed_pass', 'OWNER', True, 'ACTIVE'))
        owner_res = cur.fetchone()
        owner_id = owner_res[0] if owner_res else 2 # Fallback
        
        cur.execute("INSERT INTO users (full_name, email, phone, password, role, is_verified, status) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id",
                    ('Driver Dan', 'driver@example.com', '5556667777', 'hashed_pass', 'DRIVER', True, 'ACTIVE'))
        driver_res = cur.fetchone()
        driver_id = driver_res[0] if driver_res else 3

        # Create Vehicle
        print("Seeding Vehicle...")
        cur.execute("INSERT INTO vehicles (user_id, vehicle_number, vehicle_type, brand, model) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (vehicle_number) DO UPDATE SET brand=EXCLUDED.brand RETURNING id",
                    (driver_id, 'MH12AB1234', 'FOUR_WHEELER', 'Honda', 'Civic'))
        vehicle_res = cur.fetchone()
        vehicle_id = vehicle_res[0] if vehicle_res else 1

        # Create Parking Location
        print("Seeding Parking Location...")
        cur.execute("""INSERT INTO parking_locations (owner_id, name, address, location, total_slots, approval_mode) 
                       VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s) RETURNING id""",
                    (owner_id, 'Central Downtown Parking', '123 Main St', 73.8567, 18.5204, 50, 'AUTO'))
        location_id = cur.fetchone()[0]

        # Create Parking Slot
        print("Seeding Parking Slot...")
        cur.execute("""INSERT INTO parking_slots (location_id, slot_number, vehicle_type, status, hourly_price) 
                       VALUES (%s, %s, %s, %s, %s) ON CONFLICT (location_id, slot_number) DO UPDATE SET status='AVAILABLE' RETURNING id""",
                    (location_id, 'A1', 'FOUR_WHEELER', 'AVAILABLE', 20.00))
        slot_res = cur.fetchone()
        slot_id = slot_res[0] if slot_res else 1

        conn.commit()
        print("Initial data seeded successfully!")
        return {'driver_id': driver_id, 'vehicle_id': vehicle_id, 'slot_id': slot_id}
    except Exception as e:
        conn.rollback()
        print("Failed to seed data:", e)
    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# PYTHON CONTROLLER IMPLEMENTATION
# This perfectly mimics the JS controller's transactional behavior
# ensuring atomicity and data integrity using PostgreSQL FOR UPDATE
# ---------------------------------------------------------

class BookingControllerPy:
    def __init__(self):
        self.conn = create_connection()

    def create_booking(self, user_id, vehicle_id, slot_id, start_time, end_time, total_amount):
        """Transactional creation of a booking."""
        cur = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute("BEGIN")

            # 1. Check overlap (handled strictly by exclusion constraint in DB, but we do a fast check)
            cur.execute("""
                SELECT id FROM bookings
                WHERE slot_id = %s
                AND booking_status IN ('PENDING', 'CONFIRMED', 'BLOCKED')
                AND start_time < %s
                AND end_time > %s
            """, (slot_id, end_time, start_time))
            if cur.fetchone():
                self.conn.rollback()
                return {"error": "Slot already booked or blocked for this time slot."}

            # 2. Determine approval mode of location
            cur.execute("""
                SELECT pl.approval_mode, pl.name AS location_name, pl.owner_id 
                FROM parking_slots ps
                JOIN parking_locations pl ON ps.location_id = pl.id
                WHERE ps.id = %s FOR SHARE
            """, (slot_id,))
            loc_data = cur.fetchone()
            
            approval_mode = loc_data['approval_mode'] if loc_data else 'AUTO'
            initial_status = 'PENDING' if approval_mode == 'MANUAL' else 'CONFIRMED'

            # 3. Insert booking
            cur.execute("""
                INSERT INTO bookings (user_id, vehicle_id, slot_id, start_time, end_time, booking_status, total_amount)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (user_id, vehicle_id, slot_id, start_time, end_time, initial_status, total_amount))
            new_booking = cur.fetchone()

            # 4. Update slot status if instant confirmed
            if initial_status == 'CONFIRMED':
                cur.execute("UPDATE parking_slots SET status = 'RESERVED' WHERE id = %s", (slot_id,))

            cur.execute("COMMIT")
            return {"message": "Booking Created Successfully" if initial_status == 'CONFIRMED' else "Booking Request Submitted", "booking": new_booking}
        except Exception as e:
            self.conn.rollback()
            return {"error": str(e)}
        finally:
            cur.close()

    def checkout_booking(self, booking_id):
        """Transactional checkout ensuring idempotency."""
        cur = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute("BEGIN")

            cur.execute("SELECT * FROM bookings WHERE id = %s FOR UPDATE", (booking_id,))
            booking = cur.fetchone()

            if not booking:
                self.conn.rollback()
                return {"error": "Booking not found"}
            if booking['booking_status'] != 'ACTIVE':
                self.conn.rollback()
                return {"error": "Booking is not active"}

            cur.execute("SELECT * FROM parking_sessions WHERE booking_id = %s AND exit_time IS NULL FOR UPDATE", (booking_id,))
            session = cur.fetchone()
            if not session:
                self.conn.rollback()
                return {"error": "Parking session not found or already checked out"}

            cur.execute("UPDATE parking_sessions SET exit_time = NOW() WHERE booking_id = %s RETURNING *", (booking_id,))
            updated_session = cur.fetchone()

            # Simulate hourly logic in python
            entry = updated_session['entry_time']
            exit = updated_session['exit_time']
            diff = exit - entry
            hours = max(1, (diff.total_seconds() + 3599) // 3600) # ceil

            cur.execute("SELECT hourly_price FROM parking_slots WHERE id = %s", (booking['slot_id'],))
            slot = cur.fetchone()
            hourly_price = slot['hourly_price'] if slot else 10
            fee = hours * hourly_price

            cur.execute("UPDATE parking_sessions SET parking_fee = %s WHERE booking_id = %s", (fee, booking_id))
            cur.execute("UPDATE bookings SET booking_status = 'COMPLETED', total_amount = %s WHERE id = %s", (fee, booking_id))
            cur.execute("UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = %s", (booking['slot_id'],))

            cur.execute("COMMIT")
            return {"message": "Checkout successful", "fee": float(fee)}
        except Exception as e:
            self.conn.rollback()
            return {"error": str(e)}
        finally:
            cur.close()
            
    def close(self):
        self.conn.close()

if __name__ == '__main__':
    # 1. Seed initial entities
    ids = seed_data()
    
    if ids:
        controller = BookingControllerPy()
        
        # 2. Simulate Create Booking
        start_time = datetime.now() + timedelta(hours=1)
        end_time = start_time + timedelta(hours=2)
        print("\\nCreating booking via Python Controller...")
        res = controller.create_booking(
            user_id=ids['driver_id'],
            vehicle_id=ids['vehicle_id'],
            slot_id=ids['slot_id'],
            start_time=start_time,
            end_time=end_time,
            total_amount=40.0
        )
        print("Result:", res)
        
        controller.close()
