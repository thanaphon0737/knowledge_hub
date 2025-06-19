from fastapi import APIRouter, HTTPException, status
from app.schemas.status import StatusResponse
from app.schemas.api_model import ProcessRequest, ProcessResponse, QueryRequest, QueryResponse, SourceDocument
router = APIRouter()

@router.get("/health", response_model=StatusResponse, tags=["Monitoring"])
def health_check():
    """Health check endpoint to verify the service is running."""
    return StatusResponse(status="ok", message="Service is running smoothly.")

@router.post("/process", 
             response_model=ProcessRequest, 
             status_code=status.HTTP_202_ACCEPTED, 
             tags=["Processing"])
async def process_document(request: ProcessRequest) -> ProcessResponse:
    """
    Endpoint to process a document.
    
    Args:
        request (ProcessRequest): The request containing file details.
        
    Returns:
        ProcessResponse: Response indicating the status of the processing.
    """
    # Here you would typically call your processing logic
    # For now, we return a mock response
    return ProcessResponse(status="process_started", message="Document processing has been initiated.", file_id=request.file_id)

@router.post("/query",
             response_model=QueryResponse, 
             tags=["RAG"]
             )
async def query_document(request: QueryRequest) -> QueryResponse:
    
    print(f"Received query: {request.question} for user: {request.user_id}")
    
    # try:
    #     answer, sources = await get_rag_answer(
    #         question=request.question,
    #         document_ids=request.document_ids,
    #         user_id=request.user_id
    #     )
    #     return QueryResponse(answer = answer, sources = sources)
    # except Exception as e:
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail=f"An error occurred while processing the query: {str(e)}"
    #     )
    
    mock_answer = "This is a mock answer to your query."
    mock_sources = [
        SourceDocument(
            file_id="12345",
            file_name="example_document.pdf",
            chunk_text="This is a chunk of text from the document."
        )
    ]
    
    return QueryResponse(answer=mock_answer, sources=mock_sources)
        