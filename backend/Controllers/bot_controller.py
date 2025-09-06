from fastapi import FastAPI, HTTPException, status
from fastapi.params import Depends
from fastapi.responses import JSONResponse
from models import QuestionRequest, AnswerResponse, HealthResponse, ErrorResponse
from Services.bot_service.rag_bot_pipeline.bot import BotPipeline
import logging

# Configure logger
logger = logging.getLogger(__name__)

# Global service instance (Singleton pattern)
_bot_service_instance = None

def get_bot_service() -> BotPipeline:
    """
    Dependency injection for the BotPipeline.
    Returns a singleton instance of the bot service.
    """
    global _bot_service_instance
    if _bot_service_instance is None:
        _bot_service_instance = BotPipeline()
    return _bot_service_instance
def setup_routes(app: FastAPI):
    """
    Setup routes for the RAG Bot API."""
    
    @app.post("/ask", response_model=AnswerResponse, status_code=status.HTTP_200_OK)
    async def ask_question(request: QuestionRequest, service: BotPipeline = Depends(get_bot_service)):
        """
        Endpoint to ask a question to the RAG bot using the full pipeline.
        """
        try:
            # Extract question from request
            question = request.question if hasattr(request, 'question') else str(request)
            knowledge_base = request.knowledge_base if hasattr(request, 'knowledge_base') else None
            logger.info(f"Processing question: {question}")
        
            # Use the full_pipeline method from BotPipeline
            result = service.full_pipeline(Question=question,existing_knowledge_base=knowledge_base)
            logger.info(f"Pipeline result: {result}")
            if isinstance(result, dict):
                # Extract answer from dictionary
                answer = result.get('answer', 'Hello! How can I help you with your fitness goals?')
                current_kb = result.get('current_knowledgeBase', None)
                
                print(f"[DEBUG] Extracted answer: '{answer}'")
                print(f"[DEBUG] Extracted KB: {current_kb}")
                
            else:
                # Fallback for unexpected format
                answer = "Hello! I'm your fitness coach. How can I help you today?"
                current_kb = None
                print(f"[DEBUG] Unexpected result format, using fallback")

            
            
            return AnswerResponse(
                answer=str(answer),
                knowledge_base=current_kb
            )
            
        except Exception as e:
            logger.error(f"Error processing question: {e}")
            logger.error(f"Error type: {type(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Sorry, I'm experiencing technical difficulties."
            )

   
def get_controller_info():
    """Get information about the bot controller"""
    return {
        "controller": "bot_controller",
        "routes_count": 4,
        "models": ["QuestionRequest", "AnswerResponse", "HealthResponse"]
    }

