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
    
    try:
        await processing_pipeline.execute(
            file_id=process_request.file_id,
            user_id=process_request.user_id,
            source_type=process_request.source_type,
            source_location=process_request.source_location
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )
    return api_model.ProcessResponse(
        status="processing_initiated",
        message="Document processing has been initiated.",
        file_id=process_request.file_id
    )
    
@router.post("/query",
                response_model=api_model.QueryResponse,
                tags=["RAG"])
async def query_document(
    query_request: api_model.QueryRequest,
    request: Request
) -> api_model.QueryResponse:
    
    rag_pipeline: RagPipeline = request.app.state.rag_pipeline
    
    try:
        result = await rag_pipeline.get_answer(
            user_id=query_request.user_id,
            question=query_request.question,
        )
        # print(f"Query result: {result}")
        return api_model.QueryResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying document: {str(e)}"
        )
        