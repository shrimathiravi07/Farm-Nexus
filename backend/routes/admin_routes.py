from fastapi import APIRouter, Depends, HTTPException, status

from middleware.auth_middleware import get_current_user_id
from database.connection import get_connection, release_connection

from services.auth_service import get_all_users
from services.booking_service import get_all_appointments


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


def check_admin(user_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user or user[0] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

    finally:
        release_connection(connection)


@router.get("/stats")
def admin_stats(
    user_id: int = Depends(get_current_user_id)
):
    check_admin(user_id)

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM equipment")
        total_equipment = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM slots")
        total_slots = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM appointments")
        total_appointments = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM appointments
            WHERE status = 'pending'
            """
        )
        pending_appointments = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM appointments
            WHERE status = 'confirmed'
            """
        )
        confirmed_appointments = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM appointments
            WHERE status = 'cancelled'
            """
        )
        cancelled_appointments = cursor.fetchone()[0]

        return {
            "totalUsers": total_users,
            "totalEquipment": total_equipment,
            "totalSlots": total_slots,
            "totalAppointments": total_appointments,
            "pendingAppointments": pending_appointments,
            "confirmedAppointments": confirmed_appointments,
            "cancelledAppointments": cancelled_appointments
        }

    finally:
        release_connection(connection)


@router.get("/users")
def admin_users(
    user_id: int = Depends(get_current_user_id)
):
    check_admin(user_id)

    return get_all_users()


@router.get("/appointments")
def admin_appointments(
    user_id: int = Depends(get_current_user_id)
):
    check_admin(user_id)

    return get_all_appointments()