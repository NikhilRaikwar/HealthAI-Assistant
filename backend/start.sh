#!/bin/bash
# Start script for Railway deployment

# Set default port if PORT is not set
PORT=${PORT:-8000}

echo "Starting server on port $PORT"

# Start the application
exec uvicorn api:app --host 0.0.0.0 --port $PORT
