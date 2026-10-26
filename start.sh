#!/usr/bin/env bash
# Kerala Auto Rickshaw Taxi Simulator Launcher

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PORT=8080

echo "=========================================================="
echo "🌴 KERALA AUTO RICKSHAW TAXI SIMULATOR (കേരള ഓട്ടോ ടാക്സി) 🛺"
echo "=========================================================="
echo "Starting local web server at: http://localhost:$PORT"
echo "Open your browser and navigate to: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server."
echo "=========================================================="

cd "$DIR"
python3 -m http.server $PORT
