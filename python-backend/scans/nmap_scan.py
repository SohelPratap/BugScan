import subprocess

def run_nmap_scan(target: str):
    try:
        # Run Nmap scan with the vulners script, version detection, and HTTP header/security checks
        result = subprocess.run(
            ["nmap", "-sV", "--script", "vulners,http-headers,http-methods", target],  # Adding http headers and security script
            capture_output=True,  # Automatically captures both stdout and stderr
            text=True
        )

        # Check if the scan ran successfully
        if result.returncode == 0:
            return {"target": target, "output": result.stdout}
        else:
            return {"target": target, "error": result.stderr}

    except Exception as e:
        return {"error": str(e)}