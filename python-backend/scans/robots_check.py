import requests
import json

def check_robots_txt(target):
    url = f"http://{target}/robots.txt"
    response = requests.get(url)
    
    if response.status_code == 200:
        robots_txt = response.text
        
        # Check for sensitive information
        sensitive_dirs = ["/admin", "/config", "/backup", "/wp-admin", "/phpmyadmin"]
        sensitive_files = [".htaccess", "wp-config.php", "web.config", "config.php"]
        sensitive_endpoints = ["/api", "/console", "/debug", "/test"]
        
        # Initialize results dictionary
        results = {
            "sensitive_directories": [],
            "sensitive_files": [],
            "sensitive_endpoints": []
        }
        
        # Check for sensitive directories
        for dir in sensitive_dirs:
            if dir in robots_txt:
                results["sensitive_directories"].append(dir)
        
        # Check for sensitive files
        for file in sensitive_files:
            if file in robots_txt:
                results["sensitive_files"].append(file)
        
        # Check for sensitive endpoints
        for endpoint in sensitive_endpoints:
            if endpoint in robots_txt:
                results["sensitive_endpoints"].append(endpoint)
        
        # Return JSON if anything interesting is found
        if results["sensitive_directories"] or results["sensitive_files"] or results["sensitive_endpoints"]:
            return json.dumps(results, indent=4)
        else:
            return None
    else:
        return None

# Example usage
target = "example.com"
results = check_robots_txt(target)
if results:
    print("Interesting findings in robots.txt:\n", results)
else:
    print("No interesting findings in robots.txt.")