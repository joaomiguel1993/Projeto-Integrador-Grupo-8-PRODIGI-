#!/usr/bin/env python3
"""
Simple script to serve the frontend for testing the wine classification API.
This serves the frontend.html file so you can test the API in a browser.
"""

import http.server
import socketserver
import webbrowser
import os
import threading
import time

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving frontend at http://localhost:{PORT}")
        print(f"Open http://localhost:{PORT}/frontend.html in your browser")
        print("Make sure the FastAPI backend is running on http://localhost:8000")
        httpd.serve_forever()


if __name__ == "__main__":
    # Open browser after a short delay
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(f"http://localhost:{PORT}/frontend.html")

    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()

    run_server()
