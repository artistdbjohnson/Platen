import http.server
import socketserver
import webbrowser
import threading
import time

PORT = 8001

class Handler(http.server.SimpleHTTPRequestHandler):
    # Disable logging to keep the console clean-ish
    def log_message(self, format, *args):
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Larkspur server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()

if __name__ == "__main__":
    # Start the server in a separate thread so we can open the browser
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait a tiny bit for the server to spin up
    time.sleep(0.5)
    
    # Open Larkspur in the default web browser
    webbrowser.open(f"http://localhost:{PORT}/index.html")
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping server...")
