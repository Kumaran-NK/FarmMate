import subprocess
import sys
import time
import os
import signal

def main():
    print("Starting FarmMate services...")
    
    base_dir = os.getcwd()
    frontend_dir = os.path.join(base_dir, "frontend")
    python_exe = os.path.join(base_dir, "env", "Scripts", "python.exe")
    
    # Ensure the virtual environment exists
    if not os.path.exists(python_exe):
        print(f"Error: Virtual environment python not found at {python_exe}")
        print("Please ensure your virtual environment is set up in the 'env' folder.")
        sys.exit(1)

    # Start Backend
    # By calling the virtual environment's Python executable directly, 
    # we don't need to run the 'activate' script.
    print("[STARTING BACKEND] Running FastAPI on http://localhost:8000")
    backend_process = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=base_dir
    )
    
    # Start Frontend
    print("[STARTING FRONTEND] Running React Vite app on http://localhost:5173")
    frontend_process = subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=frontend_dir
    )
    
    try:
        # Keep the main thread alive so it can catch KeyboardInterrupt (Ctrl+C)
        while True:
            time.sleep(1)
            # If either process exits on its own, break the loop to terminate the other
            if backend_process.poll() is not None or frontend_process.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nReceived exit signal. Shutting down services...")
    finally:
        # Terminate both processes cleanly
        if backend_process.poll() is None:
            backend_process.terminate()
        if frontend_process.poll() is None:
            frontend_process.terminate()
            
        print("FarmMate services stopped successfully.")

if __name__ == "__main__":
    main()
