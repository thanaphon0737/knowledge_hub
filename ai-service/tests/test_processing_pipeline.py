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
    
    async def test_failure_on_document_loading(self, mocker, httpx_mock):
        """ทดสอบ: กรณีที่เกิด Error ตอนโหลดเอกสาร (load_from_source)"""
        # ARRANGE
        # ทำให้ขั้นตอนแรกสุดเกิด Error
        error_message = "File does not exist"
        mocker.patch('app.core.pipeline.load_from_source', side_effect=FileNotFoundError(error_message))
        
        webhook_url = "http://fake-webhook.com/error-loading"
        httpx_mock.add_response(url=webhook_url)
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())

        # ACT
        await pipeline.execute("f", "u", "d", "s", "l", webhook_url)

        # ASSERT
        requests = httpx_mock.get_requests()
        assert len(requests) == 1
        payload = json.loads(requests[0].content)
        assert payload["status"] == "ERROR"
        assert payload["errorMessage"] == error_message

    async def test_failure_on_text_splitting(self, mocker, httpx_mock):
        """ทดสอบ: กรณีที่เกิด Error ตอนตัดข้อความ (split_documents)"""
        # ARRANGE
        # Mock step ก่อนหน้าให้สำเร็จ
        mocker.patch('app.core.pipeline.load_from_source', return_value=[Document(page_content="doc")])
        
        # ทำให้ขั้นตอน text splitting เกิด Error
        
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())
        
        error_message = "Splitting failed via patch.object"
        mocker.patch.object(
        pipeline.text_splitter,  # The specific object to patch
        'split_documents',       # The method name to replace (as a string)
        side_effect=ValueError(error_message) # The error to raise
    )
        
        webhook_url = "http://fake-webhook.com/error-splitting"
        httpx_mock.add_response(url=webhook_url,method="PATCH")
        
        # ACT
        await pipeline.execute("f", "u", "d", "s", "l", webhook_url)

        # ASSERT
        requests = httpx_mock.get_requests()
        assert len(requests) == 1
        payload = json.loads(requests[0].content)
        print(payload)
        assert payload["status"] == "ERROR"
        assert payload["errorMessage"] == error_message
        # --------------------------------------------------
    def test_dependency_injection_is_working(self):
        """
        This test CHECKS if the mock object we pass into the constructor
        is the SAME object that ends up inside the pipeline instance.
        """
        # ARRANGE
        # 1. สร้าง mock object ขึ้นมา
        mock_splitter = MagicMock()
        
        # 2. พิมพ์ "เลขที่อยู่" ของ mock นี้ออกมาก่อน
        print(f"\nID of mock_splitter BEFORE init: {id(mock_splitter)}")

        # 3. ส่ง mock นี้เข้าไปใน constructor
        pipeline = ProcessingPipeline(
            text_splitter=mock_splitter,
            embedding_service=MagicMock(),
            vector_store_service=MagicMock()
        )

        # 4. พิมพ์ "เลขที่อยู่" ของ object ที่อยู่ใน pipeline ออกมา
        print(f"ID of pipeline.text_splitter AFTER init: {id(pipeline.text_splitter)}")

        # 5. ASSERT: ตรวจสอบว่า "เลขที่อยู่" ทั้งสองอันนี้ต้องเป็นเลขเดียวกัน!
        assert id(mock_splitter) == id(pipeline.text_splitter)
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