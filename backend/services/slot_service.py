from fastapi import HTTPException, status

from database.connection import get_connection, release_connection


def create_slot(
    equipment_id: int,
    provider_id: int,
    slot_date,
    start_time,
    end_time
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Check equipment belongs to provider
        cursor.execute(
            """
            SELECT id
            FROM equipment
            WHERE id = %s
              AND provider_id = %s
            """,
            (equipment_id, provider_id)
        )

        equipment = cursor.fetchone()

        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found or you are not the provider"
            )

        # Validate time
        if start_time >= end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End time must be after start time"
            )

        # Check overlapping slots
        cursor.execute(
            """
            SELECT id
            FROM slots
            WHERE equipment_id = %s
              AND date = %s
              AND start_time < %s
              AND end_time > %s
            """,
            (
                equipment_id,
                slot_date,
                end_time,
                start_time
            )
        )

        existing_slot = cursor.fetchone()

        if existing_slot:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This time slot overlaps with an existing slot"
            )

        cursor.execute(
            """
            INSERT INTO slots
            (
                equipment_id,
                provider_id,
                date,
                start_time,
                end_time,
                is_booked
            )
            VALUES (%s, %s, %s, %s, %s, FALSE)
            RETURNING
                id,
                equipment_id,
                provider_id,
                date,
                start_time,
                end_time,
                is_booked
            """,
            (
                equipment_id,
                provider_id,
                slot_date,
                start_time,
                end_time
            )
        )

        slot = cursor.fetchone()

        connection.commit()

        return slot_to_dict(slot)

    finally:
        release_connection(connection)


def get_my_slots(provider_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                equipment_id,
                provider_id,
                date,
                start_time,
                end_time,
                is_booked
            FROM slots
            WHERE provider_id = %s
            ORDER BY date, start_time
            """,
            (provider_id,)
        )

        slots = cursor.fetchall()

        return [
            slot_to_dict(slot)
            for slot in slots
        ]

    finally:
        release_connection(connection)


def get_equipment_slots(equipment_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                equipment_id,
                provider_id,
                date,
                start_time,
                end_time,
                is_booked
            FROM slots
            WHERE equipment_id = %s
              AND is_booked = FALSE
            ORDER BY date, start_time
            """,
            (equipment_id,)
        )

        slots = cursor.fetchall()

        return [
            slot_to_dict(slot)
            for slot in slots
        ]

    finally:
        release_connection(connection)


def get_all_slots():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                equipment_id,
                provider_id,
                date,
                start_time,
                end_time,
                is_booked
            FROM slots
            ORDER BY date, start_time
            """
        )

        slots = cursor.fetchall()

        return [
            slot_to_dict(slot)
            for slot in slots
        ]

    finally:
        release_connection(connection)


def delete_slot(
    slot_id: int,
    provider_id: int
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM slots
            WHERE id = %s
              AND provider_id = %s
              AND is_booked = FALSE
            RETURNING id
            """,
            (slot_id, provider_id)
        )

        deleted = cursor.fetchone()

        if not deleted:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Slot not found, already booked, or you are not the provider"
            )

        connection.commit()

        return {
            "message": "Slot deleted successfully"
        }

    finally:
        release_connection(connection)


def slot_to_dict(slot):
    return {
        "id": slot[0],
        "equipment": slot[1],
        "equipmentId": slot[1],
        "provider": slot[2],
        "providerId": slot[2],
        "date": slot[3].isoformat(),
        "startTime": slot[4].strftime("%H:%M:%S"),
        "endTime": slot[5].strftime("%H:%M:%S"),
        "isBooked": slot[6]
    }