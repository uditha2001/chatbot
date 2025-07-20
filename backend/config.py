
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Global FastAPI app instance
app = None

def create_app() -> FastAPI:
    """
    Create and configure the global FastAPI application instance.
    This function sets up the app with all necessary configurations,
    middleware, and documentation settings.
    """
    global app
    
    if app is not None:
        return app
        
    app = FastAPI(
        title="RAG Bot API",
        description="""
        ## RAG Bot API
        
        This API provides endpoints for interacting with a Retrieval-Augmented Generation (RAG) chatbot.
        
        ### Features:
        * Ask questions and get AI-powered responses
        * Get relevant document sources
        * Configurable response length
        
        ### Usage:
        Use the `/ask` endpoint to send questions to the RAG bot.
        """,
        version="1.0.0",
        contact={
            "name": "RAG Bot Support",
            "email": "support@ragbot.com",
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT",
        },
        docs_url="/docs",  # Swagger UI
        redoc_url="/redoc",  # ReDoc documentation
        openapi_url="/openapi.json"  # OpenAPI schema
    )
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("FastAPI app created successfully")
    
    # Add middleware
    _add_middleware(app)
    
    return app

def _add_middleware(app: FastAPI):
    """Add middleware to the FastAPI app"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React dev server
            "http://localhost:5173",  # Vite dev server
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """
        Global exception handler for the API.
        """
        logger.error(f"An error occurred: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(detail=str(exc)).dict()
        )
 
def get_app() -> FastAPI:
    """
    Get the global FastAPI app instance.
    Creates the app if it doesn't exist.
    """
    global app
    if app is None:
        app = create_app()
    return app

# Create the global app instance
app = create_app()
