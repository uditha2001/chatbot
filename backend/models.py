from pydantic import BaseModel, Field
from typing import List, Optional
from Services.bot_service.rag_bot_pipeline.bot import KnowledgeBase
# Request/Response models for the RAG Bot API

class QuestionRequest(BaseModel):
    """Model for handling question requests to the RAG bot"""
    question: str 
    knowledge_base: Optional[KnowledgeBase] = None
    

class AnswerResponse(BaseModel):
    """Model for handling answer responses from the RAG bot"""
    answer: str
    knowledge_base: KnowledgeBase

class HealthResponse(BaseModel):
    """Model for health check responses"""
    status: str = Field(..., description="Health status", example="healthy")
    message: str = Field(..., description="Status message", example="RAG Bot API is running")

class ErrorResponse(BaseModel):
    """Model for error responses"""
    detail: str = Field(..., description="Error details", example="An error occurred")
