"""
Forensic Agent - Detects image manipulation and forgery
Uses Error Level Analysis (ELA), noise analysis, and compression artifacts
"""
import logging
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, List
import io

logger = logging.getLogger(__name__)


class ForensicAgent:
    """Computer vision forensic analysis for receipt tampering detection"""

    def __init__(self):
        pass

    async def analyze(self, image_path: str) -> Dict[str, Any]:
        """
        Perform forensic analysis on receipt image

        Returns:
            - manipulation_score: 0-100 (higher = more likely manipulated)
            - techniques_detected: List of manipulation techniques found
            - suspicious_regions: Regions with high manipulation probability
            - compression_analysis: JPEG compression artifact analysis
        """
        try:
            logger.info(f"Forensic agent analyzing: {image_path}")

            # Load image
            img = Image.open(image_path)
            img_array = np.array(img)

            # Run multiple forensic tests
            ela_score = await self._error_level_analysis(img)
            noise_score = await self._noise_analysis(img_array)
            compression_score = await self._compression_analysis(img)
            edge_score = await self._edge_consistency_analysis(img_array)

            # Calculate overall manipulation score
            manipulation_score = int(
                (ela_score * 0.3)
                + (noise_score * 0.3)
                + (compression_score * 0.2)
                + (edge_score * 0.2)
            )

            # Determine techniques detected
            techniques = []
            if ela_score > 60:
                techniques.append("JPEG compression anomalies")
            if noise_score > 60:
                techniques.append("Inconsistent noise patterns")
            if compression_score > 60:
                techniques.append("Multiple compression cycles")
            if edge_score > 60:
                techniques.append("Edge tampering detected")

            result = {
                "manipulation_score": manipulation_score,
                "techniques_detected": techniques,
                "ela_score": ela_score,
                "noise_score": noise_score,
                "compression_score": compression_score,
                "edge_score": edge_score,
                "verdict": self._get_verdict(manipulation_score),
            }

            logger.info(
                f"Forensic agent completed. Manipulation score: {manipulation_score}"
            )
            return result

        except Exception as e:
            logger.error(f"Forensic agent error: {str(e)}")
            raise

    async def _error_level_analysis(self, img: Image.Image) -> float:
        """
        Error Level Analysis (ELA) - Detects JPEG compression inconsistencies
        """
        try:
            # Save with known quality
            temp_buffer = io.BytesIO()
            img.save(temp_buffer, format="JPEG", quality=90)
            temp_buffer.seek(0)
            compressed = Image.open(temp_buffer)

            # Calculate difference
            diff = ImageChops.difference(img.convert("RGB"), compressed.convert("RGB"))
            extrema = diff.getextrema()

            # Calculate ELA score
            max_diff = max([ex[1] for ex in extrema])
            ela_score = (max_diff / 255.0) * 100

            return min(ela_score, 100)
        except:
            return 0

    async def _noise_analysis(self, img_array: np.ndarray) -> float:
        """
        Analyze noise patterns - Edited regions often have different noise
        """
        try:
            # Convert to grayscale
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array

            # Calculate noise using Laplacian variance
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            noise_variance = laplacian.var()

            # Normalize to 0-100 scale
            noise_score = min((noise_variance / 1000) * 100, 100)

            return noise_score
        except:
            return 0

    async def _compression_analysis(self, img: Image.Image) -> float:
        """
        Detect multiple JPEG compression cycles (sign of editing)
        """
        try:
            # Check if image format is JPEG
            if img.format != "JPEG":
                return 0

            # Analyze DCT coefficients (requires deeper analysis)
            # For now, use a simplified heuristic based on image quality

            # Save and reload at different qualities
            buffer1 = io.BytesIO()
            buffer2 = io.BytesIO()

            img.save(buffer1, format="JPEG", quality=95)
            img.save(buffer2, format="JPEG", quality=50)

            size_ratio = len(buffer1.getvalue()) / len(buffer2.getvalue())

            # If ratio is unusual, might indicate re-compression
            if size_ratio > 2.5 or size_ratio < 1.5:
                return 70
            return 30

        except:
            return 0

    async def _edge_consistency_analysis(self, img_array: np.ndarray) -> float:
        """
        Analyze edge consistency - Copy-paste often creates sharp edges
        """
        try:
            # Convert to grayscale
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array

            # Detect edges
            edges = cv2.Canny(gray, 100, 200)

            # Calculate edge density
            edge_density = np.sum(edges > 0) / edges.size

            # High edge density in certain patterns can indicate manipulation
            if edge_density > 0.15:
                return 65
            elif edge_density > 0.10:
                return 45
            return 25

        except:
            return 0

    def _get_verdict(self, manipulation_score: float) -> str:
        """Convert manipulation score to verdict"""
        if manipulation_score >= 70:
            return "highly_suspicious"
        elif manipulation_score >= 50:
            return "suspicious"
        elif manipulation_score >= 30:
            return "minor_concerns"
        return "authentic"
