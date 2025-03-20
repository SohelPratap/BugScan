from fastapi import APIRouter
from scans.nmap_scan import run_nmap_scan
from scans.robots_check import check_robots_txt
from scans.ssl_scan import run_sslscan  # Correct import path
from urllib.parse import urlparse
import os
import json
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel
from api.ai_classification import classify_scan_results  # Import AI classification function

router = APIRouter()

# Ensure the reports folder exists
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)

# Define request model
class ScanRequest(BaseModel):
    url: str

@router.post("/scan/start/")
async def start_scan(request: ScanRequest):
    try:
        target_url = request.url

        # Validate and extract domain
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

        # Save results to JSON file
        report_filename = f"{domain.replace('.', '_')}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.json"
        report_path = os.path.join(REPORTS_DIR, report_filename)

        final_report = {
            "target": domain,
            "scan_results": scan_results,
            "ai_classification": ai_response
        }

        with open(report_path, "w") as json_file:
            json.dump(final_report, json_file, indent=4)

        return {"message": "Scan completed", "report_path": report_path, "data": final_report}

    except Exception as e:
        return {"error": str(e)}

# Nmap
@router.get("/scan/nmap/")
async def scan_nmap(target: str):
    # Extract domain from the full URL
    parsed_url = urlparse(target)
    domain = parsed_url.hostname  # Extract the domain (host) from the URL

    if not domain:
        return {"error": "Invalid URL, domain not found."}

    try:
        result = run_nmap_scan(domain)
        return {"target": domain, "result": result}
    except Exception as e:
        return {"error": str(e)}


#robots.txt
@router.get("/scan/robots-txt/")
async def scan_robots_txt(target: str):
    try:
        parsed_url = urlparse(target)
        domain = parsed_url.hostname  # Extract domain (host) from the URL
        
        # Call check_robots_txt function to get results
        result = check_robots_txt(domain)
        
        # If any interesting findings were found, return them
        if result:
            return {"target": domain, "result": result}
        else:
            return {"target": domain, "result": "No interesting findings in robots.txt."}
    except Exception as e:
        return {"error": str(e)}

#ssl 
@router.get("/scan/ssl/")
async def scan_ssl(target: str):
    try:
        # Extract domain from the full URL
        parsed_url = urlparse(target)
        domain = parsed_url.hostname  # Extract the domain (host) from the URL

        if not domain:
            return {"error": "Invalid URL, domain not found."}

        # Run the SSL scan using the function from ssl_scan.py
        result = run_sslscan(domain)
        return {"target": domain, "result": result}

    except Exception as e:
        return {"error": str(e)}
