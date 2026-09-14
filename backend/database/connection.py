import psycopg2
from psycopg2 import pool

from config import DATABASE_URL


connection_pool = None


def initialize_pool():
    global connection_pool

    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1,
            10,
            DATABASE_URL
        )

        print("PostgreSQL connection pool created successfully!")

    except Exception as error:
        print("PostgreSQL connection failed!")
        print("Error:", error)


def get_connection():
    if connection_pool is None:
        initialize_pool()

    return connection_pool.getconn()


def release_connection(connection):
    if connection_pool:
        connection_pool.putconn(connection)


def test_database():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT version();")

        version = cursor.fetchone()[0]

        print("PostgreSQL connected successfully!")
        print("Database version:")
        print(version)

    except Exception as error:
        print("Database test failed!")
        print("Error:", error)

    finally:
        if cursor:
            cursor.close()

        if connection:
            release_connection(connection)