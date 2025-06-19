from pydantic import BaseModel

class StatusResponse(BaseModel):
    """Response model for status endpoint."""
    status: str
    message: str
