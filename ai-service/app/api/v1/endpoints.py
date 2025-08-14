from fastapi import APIRouter, HTTPException, status, Request
from app.schemas import api_model
from app.core.pipeline import ProcessingPipeline,RagPipeline

router = APIRouter()


@router.get("/health", response_model=api_model.HealthCheckResponse, tags=["Monitoring"])
def health_check() -> api_model.HealthCheckResponse:
    """
    Health check endpoint to verify the service is running.
    """
    return api_model.HealthCheckResponse(status="ok", message="Service is running smoothly.")


@router.post("/process",
             response_model=api_model.ProcessResponse,
             status_code=status.HTTP_202_ACCEPTED,
             tags=["Processing"])

async def process_document(
    process_request: api_model.ProcessRequest,
    
    request: Request
) -> api_model.ProcessResponse:
    
    processing_pipeline: ProcessingPipeline = request.app.state.processing_pipeline
    
    if not processing_pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Processing service is not available. Service may still be initializing."
        )
    
    try:
        await processing_pipeline.execute(
            file_id = process_request.file_id,
            user_id = process_request.user_id,
            document_id = process_request.document_id,
            source_type = process_request.source_type,
            source_location = process_request.source_location,
            webhook_url = process_request.webhook_url
        )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error processing document: {str(e)}"
        )
    return api_model.ProcessResponse(
        status = "processing_initiated",
        message = "Document processing has been initiated.",
        file_id = process_request.file_id
    )
    
@router.post("/query",
                response_model=api_model.QueryResponse,
                tags=["RAG"])
def query_document(
    query_request: api_model.QueryRequest,
    request: Request
) -> api_model.QueryResponse:
    
    rag_pipeline: RagPipeline = request.app.state.rag_pipeline
    
    if not rag_pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG service is not available. Service may still be initializing."
        )
    
    try:
        result =  rag_pipeline.get_answer(
            user_id = query_request.user_id,
            document_id = query_request.document_id,
            question = query_request.question,
        )
        # print(f"Query result: {result}")
        return api_model.QueryResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error querying document: {str(e)}"
        )
        