from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import structlog

router = APIRouter()
logger = structlog.get_logger()


class CheckAccountRequest(BaseModel):
    account_hash: str
    bank_code: str = None


@router.post("/check-account")
async def check_account(request: CheckAccountRequest):
    """Check account reputation"""
    logger.info("account_check_started", account_hash=request.account_hash[:8])
    
    try:
        # TODO: Implement reputation agent in Phase 2
        return {
            "success": True,
            "trust_score": 75,
            "risk_level": "low",
            "fraud_reports": {"total": 0, "recent_30_days": 0},
            "message": "Reputation agent to be implemented in Phase 2"
        }
    except Exception as e:
        logger.error("account_check_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
