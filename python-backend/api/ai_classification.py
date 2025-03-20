import json
from openai import OpenAI
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize OpenRouter AI Client
client = OpenAI(
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

def classify_scan_results(scan_results):
    """Send actual scan results to AI for classification into P0-P4 severity levels."""
    
    prompt = f"""
Analyze the following web scan results and identify all possible vulnerabilities. For each vulnerability, provide:
1. Severity (P0 to P4, where P0 is critical and P4 is informational).
2. Type of vulnerability. If a CVE is found, include its ID and a few words about it in the 'type' section (e.g., "CVE-2021-1234: SQL Injection in login module").
3. Location (e.g., headers, parameters, URLs, etc.). Be specific about where the vulnerability is found (e.g., "in the 'Authorization' header" or "in the 'username' parameter").
4. Mitigation steps.

Return the results in the following JSON format:
{{
  "results": [
    {{
      "severity": "P1",
      "type": "SQL Injection (CVE-2021-1234: SQL Injection in login module)",
      "location": "in the 'username' parameter at http://example.com/login",
      "mitigation": "Use parameterized queries to prevent SQL injection."
    }},
    {{
      "severity": "P2",
      "type": "XSS",
      "location": "in the 'search' parameter at http://example.com/search",
      "mitigation": "Sanitize user input to prevent XSS."
    }}
  ]
}}

Scan Results:
{json.dumps(scan_results, indent=4)}
"""

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="mistralai/mistral-small-3.1-24b-instruct:free",
            stream=False
        )

        # Debugging: Print raw response before parsing
        print("RAW AI RESPONSE:", response.choices[0].message.content)

        if not response or not response.choices:
            return {"error": "Empty AI response"}

        ai_content = response.choices[0].message.content.strip()

        # Extract JSON content if wrapped in triple quotes
        json_match = re.search(r"```json\n(.*?)\n```", ai_content, re.DOTALL)
        if json_match:
            ai_content = json_match.group(1).strip()

        # Convert string to JSON object
        try:
            return json.loads(ai_content)
        except json.JSONDecodeError as e:
            return {
                "error": "Failed to parse AI response as JSON",
                "raw_response": ai_content,
                "exception": str(e)
            }

    except Exception as e:
        return {"error": str(e)}