from fastapi import APIRouter, Depends
from pydantic import BaseModel

from middleware.role_middleware import require_role

from services.booking_service import (
    create_appointment,
    get_my_appointments,
    get_provider_appointments,
    get_all_appointments,
    update_appointment,
    delete_appointment
)


router = APIRouter(
    prefix="/api/appointments",
    tags=["Appointments"]
)


class AppointmentRequest(BaseModel):
    equipment: int
    slot: int
    notes: str = ""


class AppointmentUpdateRequest(BaseModel):
    status: str


# FARMER: Create booking
@router.post("/")
def create_booking(
    data: AppointmentRequest,
    current_user: dict = Depends(require_role("farmer"))
):
    return create_appointment(
        farmer_id=current_user["id"],
        equipment_id=data.equipment,
        slot_id=data.slot,
        notes=data.notes
    )


# FARMER: View own bookings
@router.get("/my")
def my_appointments(
    current_user: dict = Depends(require_role("farmer"))
):
    return get_my_appointments(current_user["id"])


# PROVIDER: View bookings for their equipment
@router.get("/provider")
def provider_appointments(
    current_user: dict = Depends(require_role("provider"))
):
    return get_provider_appointments(current_user["id"])


# ADMIN: View all bookings
@router.get("/")
def all_appointments(
    current_user: dict = Depends(require_role("admin"))
):
    return get_all_appointments()


# PROVIDER: Update booking status
@router.put("/{appointment_id}")
def update_booking(
    appointment_id: int,
    data: AppointmentUpdateRequest,
    current_user: dict = Depends(require_role("provider"))
):
    return update_appointment(
        appointment_id=appointment_id,
        status_value=data.status,
        provider_id=current_user["id"]
    )


# FARMER: Cancel own booking
@router.delete("/{appointment_id}")
def cancel_booking(
    appointment_id: int,
    current_user: dict = Depends(require_role("farmer"))
):
    return delete_appointment(
        appointment_id,
        farmer_id=current_user["id"]
    )