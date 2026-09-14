from database.connection import get_connection, release_connection


def create_appointments_table():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                farmer_id INTEGER NOT NULL,
                equipment_id INTEGER NOT NULL,
                slot_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                notes TEXT,
                total_cost DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_appointment_farmer
                FOREIGN KEY (farmer_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

                CONSTRAINT fk_appointment_equipment
                FOREIGN KEY (equipment_id)
                REFERENCES equipment(id)
                ON DELETE CASCADE,

                CONSTRAINT fk_appointment_slot
                FOREIGN KEY (slot_id)
                REFERENCES slots(id)
                ON DELETE CASCADE
            );
        """)

        connection.commit()
        cursor.close()

    finally:
        release_connection(connection)