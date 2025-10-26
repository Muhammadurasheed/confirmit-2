from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging
import firebase_admin
from firebase_admin import firestore

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Firestore
db = firestore.client()


class CheckAccountRequest(BaseModel):
    account_hash: str
    bank_code: Optional[str] = None
    business_name: Optional[str] = None


@router.post("/check-account")
async def check_account(request: CheckAccountRequest) -> Dict:
    """
    Check account reputation and fraud reports
    
    This endpoint analyzes:
    - Fraud report history from Firestore
    - Pattern matching for known scam accounts
    - Verified business linkage
    - Risk level assessment
    """
    try:
        logger.info(f"Account check started: {request.account_hash[:8]}...")

        # 1. Query fraud reports for this account
        fraud_reports_ref = db.collection('fraud_reports')
        fraud_query = fraud_reports_ref.where('account_hash', '==', request.account_hash)
        fraud_docs = fraud_query.stream()

        total_reports = 0
        recent_reports = 0
        categories = {}

        import datetime
        thirty_days_ago = datetime.datetime.now() - datetime.timedelta(days=30)

        for doc in fraud_docs:
            data = doc.to_dict()
            total_reports += 1
            
            # Count recent reports (last 30 days)
            reported_at = data.get('reported_at')
            if reported_at and reported_at > thirty_days_ago:
                recent_reports += 1
            
            # Categorize reports
            category = data.get('category', 'unknown')
            categories[category] = categories.get(category, 0) + 1

        # 2. Check if account is linked to verified business
        verified_business_id = None
        business_ref = db.collection('businesses')
        business_query = business_ref.where('account_number_hash', '==', request.account_hash)
        business_docs = list(business_query.limit(1).stream())

        if business_docs:
            business_data = business_docs[0].to_dict()
            if business_data.get('verification_status') == 'approved':
                verified_business_id = business_docs[0].id

        # 3. Pattern matching for known scam indicators
        flags = []
        
        if total_reports > 5:
            flags.append(f"Account has been reported {total_reports} times by community members")
        
        if recent_reports > 2:
            flags.append(f"{recent_reports} fraud reports in the last 30 days - HIGH RISK")
        
        if total_reports > 0 and not verified_business_id:
            flags.append("Account has fraud reports but is not linked to a verified business")

        # Check for suspicious patterns (example patterns)
        scam_patterns = [
            ("impersonation", "Account reported for impersonating legitimate businesses"),
            ("fake_payment", "Account involved in fake payment confirmations"),
            ("advance_fee", "Advance fee fraud pattern detected"),
        ]
        
        for pattern, description in scam_patterns:
            if pattern in categories:
                flags.append(description)

        # 4. Calculate trust score (0-100)
        base_score = 100
        
        # Deduct points for fraud reports
        score_deduction = min(total_reports * 15, 70)  # Max 70 point deduction
        base_score -= score_deduction
        
        # Deduct extra for recent reports
        if recent_reports > 0:
            base_score -= recent_reports * 5
        
        # Bonus for verified business
        if verified_business_id:
            base_score = min(base_score + 20, 100)
        
        trust_score = max(base_score, 0)  # Ensure score doesn't go below 0

        # 5. Determine risk level
        if trust_score < 40 or recent_reports > 2:
            risk_level = "high"
        elif trust_score < 70 or total_reports > 0:
            risk_level = "medium"
        else:
            risk_level = "low"

        # 6. Build response
        result = {
            "success": True,
            "trust_score": trust_score,
            "risk_level": risk_level,
            "fraud_reports": {
                "total": total_reports,
                "recent_30_days": recent_reports,
                "categories": [
                    {"type": cat, "count": count}
                    for cat, count in categories.items()
                ],
            },
            "verified_business_id": verified_business_id,
            "flags": flags,
        }

        logger.info(f"Account check completed: trust_score={trust_score}, risk_level={risk_level}")
        
        return result

    except Exception as e:
        logger.error(f"Account check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
