from datetime import date, time

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from middleware.role_middleware import require_role

from services.slot_service import (
    create_slot,
    get_my_slots,
    get_equipment_slots,
    get_all_slots,
    delete_slot
)


router = APIRouter(
    prefix="/api/slots",
    tags=["Slots"]
)


class SlotRequest(BaseModel):
    equipment: int
    date: date
    startTime: time
    endTime: time


@router.get("/my")
def my_slots(
    current_user: dict = Depends(require_role("provider"))
):
    return get_my_slots(current_user["id"])


@router.get("/equipment/{equipment_id}")
def equipment_slots(equipment_id: int):
    return get_equipment_slots(equipment_id)


@router.get("/")
def all_slots():
    return get_all_slots()


@router.post("/")
def add_slot(
    data: SlotRequest,
    current_user: dict = Depends(require_role("provider"))
):
    return create_slot(
        equipment_id=data.equipment,
        provider_id=current_user["id"],
        slot_date=data.date,
        start_time=data.startTime,
        end_time=data.endTime
    )


@router.delete("/{slot_id}")
def remove_slot(
    slot_id: int,
    current_user: dict = Depends(require_role("provider"))
):
    return delete_slot(
        slot_id,
        current_user["id"]
    )