"""
Vision Agent - Uses Gemini Vision API for OCR and visual analysis
"""
import logging
import google.generativeai as genai
from PIL import Image
from typing import Dict, Any

logger = logging.getLogger(__name__)


class VisionAgent:
    """Gemini Vision API wrapper for receipt OCR and visual analysis"""

    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

    async def analyze(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze receipt image using Gemini Vision

        Returns:
            - ocr_text: Extracted text from receipt
            - confidence: OCR confidence score (0-100)
            - visual_anomalies: List of detected visual issues
            - merchant_name: Detected merchant name
            - total_amount: Detected total amount
            - receipt_date: Detected date
        """
        try:
            logger.info(f"Vision agent analyzing: {image_path}")

            # Load image
            img = Image.open(image_path)

            # Create detailed prompt for receipt analysis
            prompt = """Analyze this receipt image and extract ALL information in JSON format.

Return a JSON object with these fields:
{
  "ocr_text": "full text extracted from receipt",
  "merchant_name": "name of business/merchant",
  "total_amount": "total amount (number only)",
  "currency": "currency code (e.g., NGN, USD)",
  "receipt_date": "date on receipt (YYYY-MM-DD format)",
  "items": ["list of items purchased"],
  "account_numbers": ["any account numbers found"],
  "phone_numbers": ["any phone numbers found"],
  "visual_quality": "excellent|good|poor",
  "visual_anomalies": ["list any suspicious visual elements"],
  "confidence_score": 0-100
}

Be thorough and accurate. If any field is not found, use null."""

            # Generate content
            response = await self.model.generate_content_async([prompt, img])

            # Parse response
            response_text = response.text.strip()

            # Try to extract JSON from response
            import json
            import re

            # Find JSON in response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                analysis_data = json.loads(json_match.group())
            else:
                # Fallback if no JSON found
                analysis_data = {
                    "ocr_text": response_text,
                    "confidence_score": 70,
                    "visual_anomalies": [],
                }

            # Calculate confidence
            confidence = analysis_data.get("confidence_score", 70)

            result = {
                "ocr_text": analysis_data.get("ocr_text", response_text),
                "confidence": confidence,
                "merchant_name": analysis_data.get("merchant_name"),
                "total_amount": analysis_data.get("total_amount"),
                "currency": analysis_data.get("currency"),
                "receipt_date": analysis_data.get("receipt_date"),
                "items": analysis_data.get("items", []),
                "account_numbers": analysis_data.get("account_numbers", []),
                "phone_numbers": analysis_data.get("phone_numbers", []),
                "visual_quality": analysis_data.get("visual_quality", "good"),
                "visual_anomalies": analysis_data.get("visual_anomalies", []),
            }

            logger.info(
                f"Vision agent completed with confidence: {confidence}"
            )
            return result

        except Exception as e:
            logger.error(f"Vision agent error: {str(e)}")
            raise
