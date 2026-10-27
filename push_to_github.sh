#!/usr/bin/env bash
# Push Kerala Rickshaw Simulator to GitHub (Tathagatgowtam)

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=========================================================="
echo "🚀 Pushing Kerala Rickshaw Simulator to GitHub"
echo "Account: Tathagatgowtam"
echo "Repo: https://github.com/Tathagatgowtam/kerala-rickshaw-taxi-simulator.git"
echo "=========================================================="
echo ""
echo "Note: If you have not created the empty repo yet, create it at:"
echo "👉 https://github.com/new (Name: kerala-rickshaw-taxi-simulator)"
echo ""
echo "When prompted for password, enter your GitHub Personal Access Token:"
echo "👉 https://github.com/settings/tokens"
echo "=========================================================="
echo ""

git push -u origin main
