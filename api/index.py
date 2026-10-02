"""Vercel Serverless Function entrypoint for PostRecaller FastAPI Backend.
Routes:
  - All /api/* traffic maps to this ASGI handler.
  - Sys path is configured to load the existing backend modules seamlessly.
"""
import os
import sys
from pathlib import Path

# Ensure 'backend' directory is in Python module search path
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import the existing configured FastAPI instance from backend.server
from server import app

# Export app as required by Vercel ASGI runtime
__all__ = ["app"]
