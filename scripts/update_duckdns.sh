#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# FollowFlow — DuckDNS Domain Updater
# Maps followflow.duckdns.org -> AWS Application Load Balancer
# ==============================================================================

TOKEN="${1:-${DUCKDNS_TOKEN:-}}"
DOMAIN="${2:-followflow}"

# Resolve current AWS ALB IP or use primary public IP
ALB_HOST="followflow-alb-2061937775.us-east-1.elb.amazonaws.com"
IP=$(getent hosts "$ALB_HOST" | head -n 1 | awk '{print $1}')

if [ -z "$IP" ]; then
  IP="52.0.41.226"
fi

if [ -z "$TOKEN" ]; then
  echo "Error: DuckDNS token is required."
  echo "Usage: ./scripts/update_duckdns.sh <YOUR_DUCKDNS_TOKEN> [subdomain]"
  echo "Example: ./scripts/update_duckdns.sh a7c4d079-2b6b-4e2b-a5d3-000000000000 followflow"
  exit 1
fi

echo "Updating DuckDNS..."
echo "Subdomain: ${DOMAIN}.duckdns.org"
echo "Target IP: ${IP} (AWS Load Balancer)"

RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=${IP}")

if [ "$RESPONSE" = "OK" ]; then
  echo ""
  echo "SUCCESS! Domain is live:"
  echo "http://${DOMAIN}.duckdns.org"
  echo "http://${DOMAIN}.duckdns.org/settings"
  echo "http://${DOMAIN}.duckdns.org/profile"
else
  echo "Error updating DuckDNS: ${RESPONSE}"
  echo "Please check your DuckDNS token and domain."
  exit 1
fi
