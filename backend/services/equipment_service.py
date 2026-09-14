from fastapi import HTTPException, status

from database.connection import get_connection, release_connection


def create_equipment(
    name: str,
    description: str,
    category: str,
    price_per_hour: float,
    image_url: str,
    provider_id: int
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO equipment
            (
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id,
                is_available
            )
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            RETURNING
                id,
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id,
                is_available
            """,
            (
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id
            )
        )

        equipment = cursor.fetchone()

        connection.commit()

        return equipment_to_dict(equipment)

    finally:
        release_connection(connection)


def get_all_equipment():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                e.id,
                e.name,
                e.description,
                e.category,
                e.price_per_hour,
                e.image_url,
                e.provider_id,
                e.is_available,
                u.name AS provider_name
            FROM equipment e
            JOIN users u ON e.provider_id = u.id
            ORDER BY e.id DESC
            """
        )

        equipment_list = cursor.fetchall()

        return [
            {
                "id": item[0],
                "name": item[1],
                "description": item[2],
                "category": item[3],
                "pricePerHour": float(item[4]),
                "imageUrl": item[5],
                "provider": {
                    "id": item[6],
                    "name": item[8]
                },
                "providerId": item[6],
                "isAvailable": item[7]
            }
            for item in equipment_list
        ]

    finally:
        release_connection(connection)


def get_my_equipment(provider_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id,
                is_available
            FROM equipment
            WHERE provider_id = %s
            ORDER BY id DESC
            """,
            (provider_id,)
        )

        equipment_list = cursor.fetchall()

        return [
            equipment_to_dict(item)
            for item in equipment_list
        ]

    finally:
        release_connection(connection)


def get_equipment_by_id(equipment_id: int):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id,
                is_available
            FROM equipment
            WHERE id = %s
            """,
            (equipment_id,)
        )

        equipment = cursor.fetchone()

        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found"
            )

        return equipment_to_dict(equipment)

    finally:
        release_connection(connection)


def update_equipment(
    equipment_id: int,
    provider_id: int,
    name: str,
    description: str,
    category: str,
    price_per_hour: float,
    image_url: str,
    is_available: bool
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE equipment
            SET
                name = %s,
                description = %s,
                category = %s,
                price_per_hour = %s,
                image_url = %s,
                is_available = %s
            WHERE id = %s
              AND provider_id = %s
            RETURNING
                id,
                name,
                description,
                category,
                price_per_hour,
                image_url,
                provider_id,
                is_available
            """,
            (
                name,
                description,
                category,
                price_per_hour,
                image_url,
                is_available,
                equipment_id,
                provider_id
            )
        )

        equipment = cursor.fetchone()

        if not equipment:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found or you are not the provider"
            )

        connection.commit()

        return equipment_to_dict(equipment)

    finally:
        release_connection(connection)


def delete_equipment(
    equipment_id: int,
    provider_id: int
):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM equipment
            WHERE id = %s
              AND provider_id = %s
            RETURNING id
            """,
            (equipment_id, provider_id)
        )

        deleted = cursor.fetchone()

        if not deleted:
            connection.rollback()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found or you are not the provider"
            )

        connection.commit()

        return {
            "message": "Equipment deleted successfully"
        }

    finally:
        release_connection(connection)


def equipment_to_dict(equipment):
    return {
        "id": equipment[0],
        "name": equipment[1],
        "description": equipment[2],
        "category": equipment[3],
        "pricePerHour": float(equipment[4]),
        "imageUrl": equipment[5],
        "providerId": equipment[6],
        "isAvailable": equipment[7]
    }