from pydantic import BaseModel, Field
from typing import List, Optional

# Request/Response models for the RAG Bot API

class QuestionRequest(BaseModel):
    """Model for handling question requests to the RAG bot"""
    question: str = Field(
        ..., 
        description="The question to ask the RAG bot", 
        example="What is artificial intelligence?",
        min_length=1,
        max_length=1000
    )
    context: Optional[str] = Field(
        None, 
        description="Optional context to provide additional information", 
        example="Artificial intelligence is a branch of computer science."
    )
    max_tokens: Optional[int] = Field(
        300, 
        description="Maximum number of tokens in the response", 
        ge=1, 
        le=1000, 
        example=300
    )

class AnswerResponse(BaseModel):
    """Model for handling answer responses from the RAG bot"""
    answer: str = Field(
        ..., 
        description="The AI-generated answer", 
        example="Artificial intelligence is a branch of computer science..."
    )
    source: List[str] = Field(
        ..., 
        description="List of source documents used", 
        example=["document1.pdf", "document2.txt"]
    )
    relevant_docs_count: int = Field(
        ..., 
        description="Number of relevant documents found", 
        ge=0, 
        example=2
    )

class HealthResponse(BaseModel):
    """Model for health check responses"""
    status: str = Field(..., description="Health status", example="healthy")
    message: str = Field(..., description="Status message", example="RAG Bot API is running")

class ErrorResponse(BaseModel):
    """Model for error responses"""
    detail: str = Field(..., description="Error details", example="An error occurred")
