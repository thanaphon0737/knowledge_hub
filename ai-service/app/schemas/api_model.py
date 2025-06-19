from pydantic import BaseModel, Field
from typing import Optional, List
class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Health status of the service")
    message: Optional[str] = Field(None, description="Optional message providing additional information about the health status")
class ProcessRequest(BaseModel):
    
    file_id: str = Field(..., description="Unique identifier for the file to be processed")
    user_id: Optional[str] = Field(None, description="Optional user identifier for tracking purposes")
    source_type: str = Field(..., description="Type of the source file (e.g., 'pdf', 'docx', 'txt')")
    source_location: str = Field(..., description="Location of the source file (e.g., URL or file path)")
    
class ProcessResponse(BaseModel):
    status: str
    message: str
    file_id: str
    
class SourceDocument(BaseModel):
    """Model representing a source document."""
    file_id: str = Field(..., description="Unique identifier for the source document")
    file_name: Optional[str] = Field(None, description="Name of the source document")
    chunk_text: str
    
class QueryRequest(BaseModel):
    """Model for query requests."""
    user_id: Optional[str] = Field(None, description="Optional user identifier for tracking purposes")
    question: str = Field(..., description="The question to be answered")

    
class QueryResponse(BaseModel):
    ans: str = Field(..., description="The answer to the query")
    sources: List[str] = Field(..., description="List of sources used to generate the answer")