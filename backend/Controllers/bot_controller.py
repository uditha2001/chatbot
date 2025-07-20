from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from models import QuestionRequest, AnswerResponse, HealthResponse, ErrorResponse
import logging

# Configure logger
logger = logging.getLogger(__name__)

def setup_routes(app: FastAPI):
    """
    Setup routes for the RAG Bot API."""
    @app.post("/ask", response_model=AnswerResponse, status_code=status.HTTP_200_OK)
    async def ask_question(request: QuestionRequest):
        """
        Endpoint to ask a question to the RAG bot.
        """
        try :
 
             return AnswerResponse(
            answer="This is a mock answer.",
            source=["mock_document.pdf"],
            relevant_docs_count=1
        )
        except Exception as e:
            logger.error(f"Error processing question: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

   
def get_controller_info():
    """Get information about the bot controller"""
    return {
        "controller": "bot_controller",
        "routes_count": 4,
        "models": ["QuestionRequest", "AnswerResponse", "HealthResponse"]
    }
        
        