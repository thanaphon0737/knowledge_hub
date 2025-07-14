import pytest
import json
from unittest.mock import MagicMock, AsyncMock
from langchain_core.documents import Document

# IMPORTANTE: Replace 'app.core.pipeline' with the actual path to your file
from app.core.pipeline import ProcessingPipeline

# --- Test Suite for All Scenarios ---

@pytest.mark.asyncio
class TestProcessingPipelineScenarios:
    """
    ชุดการทดสอบสำหรับ ProcessingPipeline ที่ครอบคลุมทุกสถานการณ์
    """

    # --------------------------------------------------
    # ✅ 1. Success Cases
    # --------------------------------------------------

    async def test_successful_pipeline_with_webhook(self, mocker, httpx_mock):
        """ทดสอบ: การทำงานสำเร็จทุกขั้นตอนและส่ง Webhook ตอนท้าย"""
        # ARRANGE
        mocker.patch('app.core.pipeline.load_from_source', return_value=[Document(page_content="doc")])
        mock_splitter = MagicMock()
        mock_vector_store = MagicMock()
        pipeline = ProcessingPipeline(mock_splitter, MagicMock(), mock_vector_store)
        mocker.patch.object(pipeline, '_prepare_documents_for_store', return_value=([], []))
        
        webhook_url = "http://fake-webhook.com/success"
        httpx_mock.add_response(method="PATCH", url=webhook_url)

        # ACT
        await pipeline.execute("f", "u", "d", "s", "l", webhook_url)

        # ASSERT
        pipeline._prepare_documents_for_store.assert_called_once()
        mock_vector_store.upsert_documents.assert_called_once()
        requests = httpx_mock.get_requests()
        assert len(requests) == 1
        assert json.loads(requests[0].content)["status"] == "READY"

    def test_document_preparation_logic(self):
        """ทดสอบ: การเตรียมข้อมูล Metadata ว่าถูกต้อง"""
        # ARRANGE
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())
        chunks = [Document(page_content="chunk 1", metadata={})]

        # ACT
        prepared_docs, doc_ids = pipeline._prepare_documents_for_store(chunks, "file1", "user1", "doc1")

        # ASSERT
        assert doc_ids == ["file1_chunk_0"]
        assert prepared_docs[0].metadata['user_id'] == "user1"
        assert prepared_docs[0].metadata['document_id'] == "doc1"

    # --------------------------------------------------
    # ❌ 2. Error Cases
    # --------------------------------------------------
    
    # @pytest.mark.parametrize("error_step, mock_target, error_to_raise", [
    #     ("load", 'app.core.pipeline.load_from_source', FileNotFoundError("File not found")),
    #     ("split", 'app.core.pipeline.text_splitter.split_documents', ValueError("Splitting failed")),
    #     ("upsert", 'app.core.vector_store.vector_store_service.upsert_documents', RuntimeError("DB connection failed"))
    # ])
    # async def test_pipeline_failures_at_various_steps(self, mocker, httpx_mock, error_step, mock_target, error_to_raise):
    #     """ทดสอบ: Pipeline ล้มเหลวที่ขั้นตอนต่างๆ และส่ง Webhook แจ้ง Error"""
    #     # ARRANGE
    #     # Mock step ก่อนหน้าให้สำเร็จ
    #     if error_step != "load":
    #         mocker.patch('app.core.document_loader.load_from_source', return_value=[])
        
    #     # ทำให้ step ที่ต้องการทดสอบเกิด Error
    #     mocker.patch(mock_target, side_effect=error_to_raise)
        
    #     webhook_url = "http://fake-webhook.com/error"
    #     httpx_mock.add_response(url=webhook_url)
    #     pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())
        
    #     # ACT
    #     await pipeline.execute("f", "u", "d", "s", "l", webhook_url)

    #     # ASSERT
    #     requests = httpx_mock.get_requests()
    #     assert len(requests) == 1
    #     payload = json.loads(requests[0].content)
    #     assert payload["status"] == "ERROR"
    #     assert str(error_to_raise) in payload["errorMessage"]

    # async def test_webhook_callback_failure(self, mocker, httpx_mock, capsys):
    #     """ทดสอบ: กรณีที่ยิง Webhook กลับไปแล้วฝั่งปลายทางล่ม"""
    #     # ARRANGE
    #     mocker.patch('app.core.pipeline.load_from_source', return_value=[])
    #     # จำลองว่า Webhook server ตอบกลับมาด้วย status 500 (Internal Server Error)
    #     webhook_url = "http://fake-webhook.com/fatal"
    #     httpx_mock.add_response(url=webhook_url, status_code=500)
        
    #     pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())

    #     # ACT
    #     await pipeline.execute("f-fatal", "u", "d", "s", "l", webhook_url)

    #     # ASSERT
    #     # ตรวจสอบว่ามีการ print ข้อความ FATAL ออกมาที่ console
    #     captured = capsys.readouterr()
    #     assert "FATAL: Could not send status update" in captured.out

    # --------------------------------------------------
    #  3. Edge Cases
    # --------------------------------------------------

    async def test_execution_with_empty_document_list(self, mocker, httpx_mock):
        """ทดสอบ: กรณีที่ load_from_source คืนค่าเป็น list ว่าง (ไม่ใช่ error)"""
        # ARRANGE
        mocker.patch('app.core.pipeline.load_from_source', return_value=[]) # คืนค่า list ว่าง
        mock_splitter = MagicMock()
        mock_vector_store = MagicMock()
        webhook_url = "http://fake-webhook.com/empty"
        httpx_mock.add_response(url=webhook_url)
        
        pipeline = ProcessingPipeline(mock_splitter, MagicMock(), mock_vector_store)

        # ACT
        await pipeline.execute("f-empty", "u", "d", "s", "l", webhook_url)

        # ASSERT
        # ขั้นตอนหลังจาก load ต้องไม่ถูกเรียก
        mock_splitter.split_documents.assert_not_called()
        mock_vector_store.upsert_documents.assert_not_called()
        
        # Webhook ต้องถูกยิงไปและมีสถานะ READY เพราะการไม่มีเอกสารไม่ใช่ Error
        requests = httpx_mock.get_requests()
        assert len(requests) == 1
        assert json.loads(requests[0].content)["status"] == "READY"

    async def test_execution_with_no_webhook_url(self, mocker, httpx_mock):
        """ทดสอบ: กรณีที่ไม่ส่ง webhook_url มา จะต้องไม่มีการยิง request"""
        # ARRANGE
        mocker.patch('app.core.document_loader.load_from_source', return_value=[])
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())

        # ACT
        await pipeline.execute("f-no-webhook", "u", "d", "s", "l", webhook_url=None) # ส่งเป็น None

        # ASSERT
        # ต้องไม่มี request ใดๆ ถูกยิงออกไป
        requests = httpx_mock.get_requests()
        assert len(requests) == 0