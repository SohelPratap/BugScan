from fastapi import APIRouter
from scans.nmap_scan import run_nmap_scan
from scans.nikto_scan import run_nikto_scan
from scans.robots_check import check_robots_txt
from scans.ssl_scan import run_sslscan  # Correct import path
from urllib.parse import urlparse

router = APIRouter()


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

# Nikto
@router.get("/scan/nikto/")
async def scan_nikto(target: str):
    # Extract domain from the full URL
    parsed_url = urlparse(target)
    domain = parsed_url.hostname  # Extract the domain (host) from the URL

    if not domain:
        return {"error": "Invalid URL, domain not found."}

    try:
        result = run_nikto_scan(domain)
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




