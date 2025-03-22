import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from urllib.parse import urlparse
from scans.nmap_scan import run_nmap_scan
from scans.ssl_scan import run_sslscan
from scans.robots_check import check_robots_txt
from api.ai_classification import classify_scan_results  # Import AI classification function

router = APIRouter()



# Define request model
class ScanRequest(BaseModel):
    url: str

@router.post("/scan/start/")
async def start_scan(request: ScanRequest):
    try:
        target_url = request.url
        parsed_url = urlparse(target_url)
        domain = parsed_url.hostname

        if not domain:
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Run security scans
        scan_results = {
            "nmap": run_nmap_scan(domain),
            "sslscan": run_sslscan(domain),
            "robots_txt": check_robots_txt(domain)
        }

        # Send results to AI for classification
        ai_response = classify_scan_results(scan_results)

        # Validate AI response
        if "results" not in ai_response:
            raise HTTPException(status_code=500, detail="AI response format incorrect")

        # Prepare the final report
        final_report = {
            "target": domain,
            "scan_results": scan_results,
            "ai_classification": ai_response["results"]
        }

        return {"message": "Scan completed", "data": final_report}

    except Exception as e:
        return {"error": str(e)}
