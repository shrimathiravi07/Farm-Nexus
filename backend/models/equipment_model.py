from database.connection import get_connection, release_connection


def create_equipment_table():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS equipment (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                price_per_hour DECIMAL(10,2) NOT NULL,
                image_url TEXT,
                provider_id INTEGER NOT NULL,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_equipment_provider
                FOREIGN KEY (provider_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            );
        """)

        connection.commit()
        cursor.close()

    finally:
        release_connection(connection)