from config import get_app
from Controllers.bot_controller import setup_routes
import uvicorn

# Get the global FastAPI app instance
app = get_app()

# Setup routes from controllers
setup_routes(app)

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
