from fastapi import HTTPException, status

from database.connection import get_connection, release_connection
from utils.password_handler import hash_password, verify_password
from utils.jwt_handler import create_access_token


def register_user(
    name: str,
    email: str,
    password: str,
    role: str = "farmer"
):
    # Public registration is allowed only for farmer/provider.
    # Admin accounts should be created separately by the database/admin team.
    if role not in {"farmer", "provider"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either farmer or provider"
        )

    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Check whether email already exists
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password before storing it
        hashed_password = hash_password(password)

        # Create user
        cursor.execute(
            """
            INSERT INTO users
            (name, email, password, role)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, email, role, created_at
            """,
            (
                name,
                email,
                hashed_password,
                role
            )
        )

        user = cursor.fetchone()

        connection.commit()

        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "created_at": user[4]
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise

    finally:
        if "cursor" in locals() and cursor:
            cursor.close()

        release_connection(connection)


def login_user(
    email: str,
    password: str
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Find user by email
        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        # User not found
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        user_id = user[0]
        name = user[1]
        user_email = user[2]
        hashed_password = user[3]
        role = user[4]

        # Verify password
        if not verify_password(password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create JWT token
        token = create_access_token(user_id)

        return {
            "token": token,
            "user": {
                "id": user_id,
                "name": name,
                "email": user_email,
                "role": role
            }
        }

    finally:
        if "cursor" in locals() and cursor:
            cursor.close()

        release_connection(connection)


def get_user_profile(user_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, name, email, role, created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3],
            "created_at": user[4]
        }

    finally:
        if "cursor" in locals() and cursor:
            cursor.close()

        release_connection(connection)


def get_all_users():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY id DESC
            """
        )

        users = cursor.fetchall()

        return [
            {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "created_at": user[4]
            }
            for user in users
        ]

    finally:
        if "cursor" in locals() and cursor:
            cursor.close()

        release_connection(connection)