from fastapi import APIRouter
from app.schemas.status import StatusResponse

router = APIRouter()

@router.get("/health", response_model=StatusResponse, tags=["Monitoring"])
def health_check():
    """Health check endpoint to verify the service is running."""
    return StatusResponse(status="ok", message="Service is running smoothly.")