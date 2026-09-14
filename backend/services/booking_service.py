from fastapi import HTTPException, status

from database.connection import get_connection, release_connection


def create_appointment(
    farmer_id: int,
    equipment_id: int,
    slot_id: int,
    notes: str = ""
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Lock the slot row to prevent double booking
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
            WHERE id = %s
            FOR UPDATE
            """,
            (slot_id,)
        )

        slot = cursor.fetchone()

        if not slot:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Slot not found"
            )

        slot_id_db = slot[0]
        slot_equipment_id = slot[1]
        start_time = slot[4]
        end_time = slot[5]
        is_booked = slot[6]

        # Make sure the slot belongs to the requested equipment
        if slot_equipment_id != equipment_id:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slot does not belong to this equipment"
            )

        # Prevent double booking
        if is_booked:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This slot is already booked"
            )

        # Get equipment price
        cursor.execute(
            """
            SELECT
                id,
                name,
                price_per_hour
            FROM equipment
            WHERE id = %s
              AND is_available = TRUE
            """,
            (equipment_id,)
        )

        equipment = cursor.fetchone()

        if not equipment:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found or unavailable"
            )

        price_per_hour = float(equipment[2])

        # Calculate duration in hours
        duration_seconds = (
            end_time.hour * 3600
            + end_time.minute * 60
            + end_time.second
        ) - (
            start_time.hour * 3600
            + start_time.minute * 60
            + start_time.second
        )

        duration_hours = duration_seconds / 3600

        if duration_hours <= 0:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid slot duration"
            )

        total_cost = duration_hours * price_per_hour

        # Create appointment
        cursor.execute(
            """
            INSERT INTO appointments
            (
                farmer_id,
                equipment_id,
                slot_id,
                status,
                notes,
                total_cost
            )
            VALUES (%s, %s, %s, 'pending', %s, %s)
            RETURNING
                id,
                farmer_id,
                equipment_id,
                slot_id,
                status,
                notes,
                total_cost,
                created_at
            """,
            (
                farmer_id,
                equipment_id,
                slot_id_db,
                notes,
                total_cost
            )
        )

        appointment = cursor.fetchone()

        # Mark slot as booked
        cursor.execute(
            """
            UPDATE slots
            SET is_booked = TRUE
            WHERE id = %s
            """,
            (slot_id_db,)
        )

        connection.commit()

        return appointment_to_dict(appointment)

    except HTTPException:
        raise

    except Exception:
        connection.rollback()
        raise

    finally:
        release_connection(connection)


def get_my_appointments(farmer_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                a.id,
                a.farmer_id,
                a.equipment_id,
                a.slot_id,
                a.status,
                a.notes,
                a.total_cost,
                a.created_at,
                e.name AS equipment_name,
                e.price_per_hour,
                s.date,
                s.start_time,
                s.end_time,
                u.name AS provider_name
            FROM appointments a
            JOIN equipment e
                ON a.equipment_id = e.id
            JOIN slots s
                ON a.slot_id = s.id
            JOIN users u
                ON e.provider_id = u.id
            WHERE a.farmer_id = %s
            ORDER BY a.id DESC
            """,
            (farmer_id,)
        )

        appointments = cursor.fetchall()

        return [
            appointment_detail_to_dict(item)
            for item in appointments
        ]

    finally:
        release_connection(connection)


def get_provider_appointments(provider_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                a.id,
                a.farmer_id,
                a.equipment_id,
                a.slot_id,
                a.status,
                a.notes,
                a.total_cost,
                a.created_at,
                e.name AS equipment_name,
                e.price_per_hour,
                s.date,
                s.start_time,
                s.end_time,
                u.name AS farmer_name,
                u.email AS farmer_email
            FROM appointments a
            JOIN equipment e
                ON a.equipment_id = e.id
            JOIN slots s
                ON a.slot_id = s.id
            JOIN users u
                ON a.farmer_id = u.id
            WHERE e.provider_id = %s
            ORDER BY a.id DESC
            """,
            (provider_id,)
        )

        appointments = cursor.fetchall()

        return [
            provider_appointment_to_dict(item)
            for item in appointments
        ]

    finally:
        release_connection(connection)


def get_all_appointments():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                a.id,
                a.farmer_id,
                a.equipment_id,
                a.slot_id,
                a.status,
                a.notes,
                a.total_cost,
                a.created_at,
                e.name AS equipment_name,
                s.date,
                s.start_time,
                s.end_time,
                farmer.name AS farmer_name,
                provider.name AS provider_name
            FROM appointments a
            JOIN equipment e
                ON a.equipment_id = e.id
            JOIN slots s
                ON a.slot_id = s.id
            JOIN users farmer
                ON a.farmer_id = farmer.id
            JOIN users provider
                ON e.provider_id = provider.id
            ORDER BY a.id DESC
            """
        )

        appointments = cursor.fetchall()

        return [
            admin_appointment_to_dict(item)
            for item in appointments
        ]

    finally:
        release_connection(connection)


def update_appointment(
    appointment_id: int,
    status_value: str,
    provider_id: int
):
    allowed_statuses = {
        "pending",
        "confirmed",
        "cancelled",
        "completed"
    }

    if status_value not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid appointment status"
        )

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                a.id,
                a.slot_id,
                a.status
            FROM appointments a
            JOIN equipment e
                ON a.equipment_id = e.id
            WHERE a.id = %s
              AND e.provider_id = %s
            """,
            (appointment_id, provider_id)
        )

        appointment = cursor.fetchone()

        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found or you are not the provider"
            )

        old_status = appointment[2]
        slot_id = appointment[1]

        cursor.execute(
            """
            UPDATE appointments
            SET status = %s
            WHERE id = %s
            RETURNING
                id,
                farmer_id,
                equipment_id,
                slot_id,
                status,
                notes,
                total_cost,
                created_at
            """,
            (status_value, appointment_id)
        )

        updated = cursor.fetchone()

        # If appointment is cancelled, make slot available again
        if status_value == "cancelled" and old_status != "cancelled":
            cursor.execute(
                """
                UPDATE slots
                SET is_booked = FALSE
                WHERE id = %s
                """,
                (slot_id,)
            )

        # If a cancelled appointment is confirmed again,
        # make the slot booked again.
        elif (
            old_status == "cancelled"
            and status_value in {"pending", "confirmed"}
        ):
            cursor.execute(
                """
                SELECT is_booked
                FROM slots
                WHERE id = %s
                FOR UPDATE
                """,
                (slot_id,)
            )

            slot = cursor.fetchone()

            if slot and slot[0]:
                connection.rollback()

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This slot is already booked by another appointment"
                )

            cursor.execute(
                """
                UPDATE slots
                SET is_booked = TRUE
                WHERE id = %s
                """,
                (slot_id,)
            )

        connection.commit()

        return appointment_to_dict(updated)

    finally:
        release_connection(connection)


def delete_appointment(
    appointment_id: int,
    farmer_id: int
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                slot_id,
                status
            FROM appointments
            WHERE id = %s
              AND farmer_id = %s
            """,
            (appointment_id, farmer_id)
        )

        appointment = cursor.fetchone()

        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        slot_id = appointment[0]

        cursor.execute(
            """
            UPDATE appointments
            SET status = 'cancelled'
            WHERE id = %s
            """,
            (appointment_id,)
        )

        cursor.execute(
            """
            UPDATE slots
            SET is_booked = FALSE
            WHERE id = %s
            """,
            (slot_id,)
        )

        connection.commit()

        return {
            "message": "Appointment cancelled successfully"
        }

    finally:
        release_connection(connection)


def appointment_to_dict(appointment):
    return {
        "id": appointment[0],
        "farmer": appointment[1],
        "equipment": appointment[2],
        "slot": appointment[3],
        "status": appointment[4],
        "notes": appointment[5],
        "totalCost": float(appointment[6]),
        "createdAt": appointment[7]
    }


def appointment_detail_to_dict(item):
    return {
        "id": item[0],
        "farmer": item[1],
        "equipment": item[2],
        "slot": item[3],
        "status": item[4],
        "notes": item[5],
        "totalCost": float(item[6]),
        "createdAt": item[7],
        "equipmentName": item[8],
        "pricePerHour": float(item[9]),
        "date": item[10].isoformat(),
        "startTime": item[11].strftime("%H:%M:%S"),
        "endTime": item[12].strftime("%H:%M:%S"),
        "providerName": item[13]
    }


def provider_appointment_to_dict(item):
    return {
        "id": item[0],
        "farmer": item[1],
        "equipment": item[2],
        "slot": item[3],
        "status": item[4],
        "notes": item[5],
        "totalCost": float(item[6]),
        "createdAt": item[7],
        "equipmentName": item[8],
        "pricePerHour": float(item[9]),
        "date": item[10].isoformat(),
        "startTime": item[11].strftime("%H:%M:%S"),
        "endTime": item[12].strftime("%H:%M:%S"),
        "farmerName": item[13],
        "farmerEmail": item[14]
    }


def admin_appointment_to_dict(item):
    return {
        "id": item[0],
        "farmer": item[1],
        "equipment": item[2],
        "slot": item[3],
        "status": item[4],
        "notes": item[5],
        "totalCost": float(item[6]),
        "createdAt": item[7],
        "equipmentName": item[8],
        "date": item[9].isoformat(),
        "startTime": item[10].strftime("%H:%M:%S"),
        "endTime": item[11].strftime("%H:%M:%S"),
        "farmerName": item[12],
        "providerName": item[13]
    }