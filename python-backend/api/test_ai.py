import json
import sys
import os

# Add the parent directory to sys.path to ensure imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_classification import classify_scan_results  # Corrected import

# Sample scan results for testing AI classification
test_scan_results = {
    "nmap": "Open ports found: 80, 443. Apache outdated.",
    "nikto": "Possible SQL Injection on /login (CVE-2021-1234)",
    "sslscan": "Weak SSL/TLS detected. TLS 1.0 is enabled.",
    "robots_txt": "Sensitive directories exposed: /admin, /backup"
}

# Call the AI classification function
ai_response = classify_scan_results(test_scan_results)

# Print the AI response
print("AI Classification Response:")
print(json.dumps(ai_response, indent=2))