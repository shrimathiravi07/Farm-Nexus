from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.equipment_routes import router as equipment_router
from routes.slot_routes import router as slot_router
from routes.booking_routes import router as booking_router
from routes.admin_routes import router as admin_router


app = FastAPI(
    title="Farm-Nexus API",
    description="Smart Agricultural Equipment & Resource Sharing Platform",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# API Routes
app.include_router(auth_router)
app.include_router(equipment_router)
app.include_router(slot_router)
app.include_router(booking_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "Farm-Nexus API is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }