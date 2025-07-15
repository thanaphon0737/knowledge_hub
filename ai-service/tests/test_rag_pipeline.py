import pytest
from unittest.mock import MagicMock, AsyncMock
from langchain_core.documents import Document

# Replace with the actual path to your pipeline classes
from app.core.pipeline import RagPipeline

@pytest.mark.asyncio
class TestRagPipeline:
    """Groups tests for the RAG and answer generation pipeline."""

    def test_initialization(self, mocker):
        """Tests that the pipeline initializes the CrossEncoder correctly."""
        # ARRANGE
        mock_cross_encoder = mocker.patch('app.core.pipeline.CrossEncoder')
        
        # ACT
        RagPipeline(MagicMock(), MagicMock(), cross_encoder_model_name='test-model')

        # ASSERT
        mock_cross_encoder.assert_called_once_with('test-model')

    def test_reranker_logic(self, mocker):
        """Unit Test: Verifies the re-ranking and sorting logic."""
        # ARRANGE
        mock_cross_encoder = mocker.patch('app.core.pipeline.CrossEncoder')
        # The second document should be ranked higher (0.9 > 0.1)
        mock_cross_encoder.return_value.predict.return_value = [0.1, 0.9]
        
        pipeline = RagPipeline(MagicMock(), MagicMock())
        docs_to_rank = [Document(page_content="low score"), Document(page_content="high score")]

        # ACT
        top_docs = pipeline._reranker_docuements("query", docs_to_rank, top_n=1)

        # ASSERT
        assert len(top_docs) == 1
        assert top_docs[0].page_content == "high score"

    def test_build_prompt_logic(self):
        """Unit Test: Verifies the prompt is built correctly."""
        # ARRANGE
        pipeline = RagPipeline(MagicMock(), MagicMock())
        question = "Test Question?"
        docs = [Document(page_content="This is the context.", metadata={"source": "test.pdf", "page": 1})]
        
        # ACT
        prompt = pipeline._create_llm_prompt(question, docs)

        # ASSERT
        assert "You are a highly precise and factual assistant" in prompt
        assert "Source [1] (from: test.pdf, page: 1):\nThis is the context." in prompt
        assert "Question:\nTest Question?" in prompt

    async def test_get_answer_success_path(self, mocker):
        """
        Integration Test: Verifies the entire success path of the 'get_answer' method.
        """
        # ARRANGE
        # 1. Mock all external and internal dependencies
        mock_retriever = MagicMock()
        # The retriever's invoke method is now async in the latest LangChain versions
        mock_retriever.invoke = AsyncMock(return_value=[Document(page_content="retrieved doc", metadata={})])
        
        mock_vector_store = MagicMock()
        mock_vector_store.get_retriever.return_value = mock_retriever
        
        mock_llm = MagicMock()
        # The LLM's invoke method is also async
        mock_llm.invoke = AsyncMock(return_value=MagicMock(content="Final LLM answer."))
        
        mocker.patch('app.core.pipeline.CrossEncoder')
        
        # 2. Create the pipeline instance with mocked services
        pipeline = RagPipeline(mock_vector_store, mock_llm)
        # Mock the helper method to isolate this test to the get_answer logic
        mocker.patch.object(pipeline, '_reranker_docuements', return_value=mock_retriever.invoke.return_value)

        # ACT
        result = await pipeline.get_answer("user1", "doc1", "test question")

        # ASSERT
        mock_vector_store.get_retriever.assert_called_once()
        mock_retriever.invoke.assert_awaited_once_with("test question")
        mock_llm.invoke.assert_awaited_once()
        assert result['answer'] == "Final LLM answer."
        assert len(result['sources']) == 1
        assert result['sources'][0]['page_content'] == "retrieved doc"

    async def test_get_answer_no_docs_found(self):
        """Edge Case Test: Verifies correct behavior when retriever finds no documents."""
        # ARRANGE
        mock_retriever = MagicMock()
        mock_retriever.invoke = AsyncMock(return_value=[]) # Return an empty list
        
        mock_vector_store = MagicMock()
        mock_vector_store.get_retriever.return_value = mock_retriever
        
        pipeline = RagPipeline(mock_vector_store, MagicMock())

        # ACT
        result = await pipeline.get_answer("user1", "doc1", "test question")

        # ASSERT
        assert result['answer'] == "I cannot find the answer in the provided documents."
        assert result['sources'] == []