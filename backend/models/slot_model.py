from database.connection import get_connection, release_connection


def create_slots_table():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS slots (
                id SERIAL PRIMARY KEY,
                equipment_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                is_booked BOOLEAN DEFAULT FALSE,

                CONSTRAINT fk_slot_equipment
                FOREIGN KEY (equipment_id)
                REFERENCES equipment(id)
                ON DELETE CASCADE,

                CONSTRAINT fk_slot_provider
                FOREIGN KEY (provider_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            );
        """)

        connection.commit()
        cursor.close()

    finally:
        release_connection(connection)