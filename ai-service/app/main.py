from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
from app.config import settings

# ✅ Initialize Firebase early
from app.core import firebase  # <-- Add this line!

# Now safe to import routers
from app.routers import receipts, accounts

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger()

# Initialize FastAPI app
app = FastAPI(
    title="ConfirmIT AI Service",
    description="Multi-Agent AI system for receipt verification and fraud detection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(receipts.router, prefix="/api", tags=["receipts"])
app.include_router(accounts.router, prefix="/api", tags=["accounts"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "ConfirmIT AI Service",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "agents": {
            "vision": "ready",
            "forensic": "ready",
            "metadata": "ready",
            "reputation": "ready",
            "reasoning": "ready",
        },
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    )
