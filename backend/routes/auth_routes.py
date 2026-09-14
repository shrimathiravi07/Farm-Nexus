from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr

from services.auth_service import (
    register_user,
    login_user,
    get_user_profile,
    get_all_users
)

from middleware.auth_middleware import get_current_user_id


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "farmer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(data: RegisterRequest):

    return register_user(
        data.name,
        data.email,
        data.password,
        data.role
    )


@router.post("/login")
def login(data: LoginRequest):

    return login_user(
        data.email,
        data.password
    )


@router.get("/profile")
def profile(
    user_id: int = Depends(get_current_user_id)
):

    return get_user_profile(user_id)


@router.get("/users")
def users(
    user_id: int = Depends(get_current_user_id)
):

    # Admin authorization will be added later.
    return get_all_users()