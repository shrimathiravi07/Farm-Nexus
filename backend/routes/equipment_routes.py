from fastapi import APIRouter, Depends
from pydantic import BaseModel

from middleware.auth_middleware import get_current_user_id
from middleware.role_middleware import require_role

from services.equipment_service import (
    create_equipment,
    get_all_equipment,
    get_my_equipment,
    get_equipment_by_id,
    update_equipment,
    delete_equipment
)


router = APIRouter(
    prefix="/api/equipment",
    tags=["Equipment"]
)


class EquipmentRequest(BaseModel):
    name: str
    description: str = ""
    category: str = ""
    pricePerHour: float
    imageUrl: str = ""


class EquipmentUpdateRequest(BaseModel):
    name: str
    description: str = ""
    category: str = ""
    pricePerHour: float
    imageUrl: str = ""
    isAvailable: bool = True


@router.get("/")
def all_equipment():
    return get_all_equipment()


@router.get("/my")
def my_equipment(
    current_user: dict = Depends(require_role("provider"))
):
    return get_my_equipment(current_user["id"])


@router.get("/{equipment_id}")
def equipment_details(equipment_id: int):
    return get_equipment_by_id(equipment_id)


@router.post("/")
def add_equipment(
    data: EquipmentRequest,
    current_user: dict = Depends(require_role("provider"))
):
    return create_equipment(
        name=data.name,
        description=data.description,
        category=data.category,
        price_per_hour=data.pricePerHour,
        image_url=data.imageUrl,
        provider_id=current_user["id"]
    )


@router.put("/{equipment_id}")
def edit_equipment(
    equipment_id: int,
    data: EquipmentUpdateRequest,
    current_user: dict = Depends(require_role("provider"))
):
    return update_equipment(
        equipment_id=equipment_id,
        provider_id=current_user["id"],
        name=data.name,
        description=data.description,
        category=data.category,
        price_per_hour=data.pricePerHour,
        image_url=data.imageUrl,
        is_available=data.isAvailable
    )


@router.delete("/{equipment_id}")
def remove_equipment(
    equipment_id: int,
    current_user: dict = Depends(require_role("provider"))
):
    return delete_equipment(
        equipment_id,
        current_user["id"]
    )