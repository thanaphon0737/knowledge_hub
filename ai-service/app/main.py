from fastapi import FastAPI
from app.api.v1 import endpoints as v1_endpoints

app = FastAPI(title="My FastAPI Application", version="1.0.0")

app.include_router(v1_endpoints.router, prefix="/api/v1", tags=["v1"])

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint to verify the service is running."""
    return {"message": "Welcome to My FastAPI Application!"}

