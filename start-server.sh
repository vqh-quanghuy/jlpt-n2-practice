#!/bin/bash

# JLPT N2 Practice - Local Server Setup Script

echo "🚀 Starting JLPT N2 Practice App..."
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the n2-practice directory."
    exit 1
fi

# Check if data files exist
if [ ! -f "data/n2-vocab.tsv" ] || [ ! -f "data/n2-kanji.tsv" ] || [ ! -f "data/n2-grammar.tsv" ]; then
    echo "⚠️  Warning: Some TSV data files are missing in the data/ folder."
    echo "   Make sure you have:"
    echo "   - data/n2-vocab.tsv"
    echo "   - data/n2-kanji.tsv"
    echo "   - data/n2-grammar.tsv"
    echo ""
fi

# Try to start a local server
PORT=8000

echo "🔍 Looking for available server options..."

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found. Starting server with Python 3..."
    echo "📱 Open your browser and go to: http://localhost:$PORT"
    echo "🛑 Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server $PORT
    exit 0
fi

# Check for Python 2
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    if [[ $PYTHON_VERSION == *"2."* ]]; then
        echo "✅ Python 2 found. Starting server with Python 2..."
        echo "📱 Open your browser and go to: http://localhost:$PORT"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python -m SimpleHTTPServer $PORT
        exit 0
    else
        echo "✅ Python 3 found. Starting server with Python 3..."
        echo "📱 Open your browser and go to: http://localhost:$PORT"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python -m http.server $PORT
        exit 0
    fi
fi

# Check for Node.js and http-server
if command -v npx &> /dev/null; then
    echo "✅ Node.js found. Starting server with npx..."
    echo "📱 Open your browser and go to: http://localhost:$PORT"
    echo "🛑 Press Ctrl+C to stop the server"
    echo ""
    npx http-server -p $PORT
    exit 0
fi

# Check for PHP
if command -v php &> /dev/null; then
    echo "✅ PHP found. Starting server with PHP..."
    echo "📱 Open your browser and go to: http://localhost:$PORT"
    echo "🛑 Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:$PORT
    exit 0
fi

# No server options found
echo "❌ No suitable server found. Please install one of the following:"
echo ""
echo "Option 1 - Python:"
echo "  Download from: https://www.python.org/downloads/"
echo "  Then run: python -m http.server 8000"
echo ""
echo "Option 2 - Node.js:"
echo "  Download from: https://nodejs.org/"
echo "  Then run: npx http-server -p 8000"
echo ""
echo "Option 3 - Use VS Code with Live Server extension"
echo ""
echo "⚠️  Note: You cannot run this app by simply opening index.html in your browser"
echo "   due to browser security restrictions with local file access."
