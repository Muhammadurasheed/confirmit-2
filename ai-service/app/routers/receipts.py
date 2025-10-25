from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import logging
import os
import httpx
from app.agents.orchestrator import ReceiptAnalysisOrchestrator
from app.agents.vision_agent import VisionAgent
from app.agents.forensic_agent import ForensicAgent
from app.agents.metadata_agent import MetadataAgent
from app.agents.reputation_agent import ReputationAgent
from app.agents.reasoning_agent import ReasoningAgent

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize agents
gemini_api_key = os.getenv("GEMINI_API_KEY")
vision_agent = VisionAgent(gemini_api_key) if gemini_api_key else None
forensic_agent = ForensicAgent()
metadata_agent = MetadataAgent()
reputation_agent = ReputationAgent()
reasoning_agent = ReasoningAgent()

# Initialize orchestrator
if vision_agent:
    orchestrator = ReceiptAnalysisOrchestrator(
        vision_agent=vision_agent,
        forensic_agent=forensic_agent,
        metadata_agent=metadata_agent,
        reputation_agent=reputation_agent,
        reasoning_agent=reasoning_agent,
    )
else:
    logger.warning("Gemini API key not configured. Vision agent disabled.")
    orchestrator = None


class AnalyzeReceiptRequest(BaseModel):
    image_url: str
    receipt_id: str


@router.post("/analyze-receipt")
async def analyze_receipt(request: AnalyzeReceiptRequest) -> Dict[str, Any]:
    """
    Analyze receipt image for authenticity using multi-agent system

    This endpoint coordinates multiple AI agents:
    - Vision Agent (Gemini): OCR and visual analysis
    - Forensic Agent: Image manipulation detection
    - Metadata Agent: EXIF data analysis
    - Reputation Agent: Merchant/account verification
    - Reasoning Agent: Synthesis and verdict
    """
    try:
        logger.info(f"Received analysis request for receipt: {request.receipt_id}")

        if not orchestrator:
            raise HTTPException(
                status_code=503,
                detail="AI service not properly configured. Check GEMINI_API_KEY.",
            )

        # Download image from Cloudinary
        image_path = await download_image(request.image_url, request.receipt_id)

        # Run multi-agent analysis
        result = await orchestrator.analyze_receipt(image_path, request.receipt_id)

        logger.info(f"Analysis completed for receipt: {request.receipt_id}")
        return result

    except Exception as e:
        logger.error(f"Analysis failed for receipt {request.receipt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def download_image(image_url: str, receipt_id: str) -> str:
    """Download image from Cloudinary to local temp storage"""
    try:
        import tempfile

        async with httpx.AsyncClient() as client:
            response = await client.get(image_url, timeout=30.0)
            response.raise_for_status()

            # Save to temp file
            temp_dir = tempfile.gettempdir()
            image_path = os.path.join(temp_dir, f"{receipt_id}.jpg")

            with open(image_path, "wb") as f:
                f.write(response.content)

            logger.info(f"Image downloaded: {image_path}")
            return image_path

    except Exception as e:
        logger.error(f"Failed to download image: {str(e)}")
        raise
