import subprocess

def run_sslscan(target: str):
    try:
        # Run sslscan command to check for SSL/TLS vulnerabilities
        result = subprocess.run(
            ["sslscan", target],  # Running sslscan for the target URL
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