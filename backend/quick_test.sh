#!/bin/bash
# Quick test script for the Three.js Pipeline

echo "=================================="
echo "Three.js Pipeline Quick Test"
echo "=================================="
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

echo ""
echo "1. Running unit tests..."
echo "----------------------------------"
python tests/test_threejs_pipeline.py

echo ""
echo "2. Checking if server is running..."
echo "----------------------------------"
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Server is running"
    echo ""
    echo "3. Testing API endpoints..."
    echo "----------------------------------"
    python tests/test_api_endpoints.py
else
    echo "⚠️  Server is not running"
    echo ""
    echo "To start the server, run:"
    echo "  python -m uvicorn app.main:app --reload"
    echo ""
    echo "Then run this script again to test API endpoints."
fi

echo ""
echo "=================================="
echo "Quick test completed!"
echo "=================================="
