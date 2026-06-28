#!/bin/bash
# deploy_server.sh - Run this ON the Oracle VM to set up and start APIForge
set -e

echo "=== [1/7] Installing Docker ==="
sudo yum install -y docker || sudo dnf install -y docker || true
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker opc || true

echo "=== [2/7] Installing Docker Compose ==="
if ! command -v docker-compose &> /dev/null; then
    sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi
docker-compose --version || docker compose version

echo "=== [3/7] Installing git ==="
sudo yum install -y git || sudo dnf install -y git || true

echo "=== [4/7] Cloning or updating repository ==="
if [ -d ~/apiforge ]; then
    echo "Repo exists, pulling latest..."
    cd ~/apiforge && git pull origin main
else
    echo "Cloning fresh..."
    git clone https://github.com/Jaswanth5464/apiforge ~/apiforge
fi
cd ~/apiforge

echo "=== [5/7] Patching API URL in docker-compose.yml ==="
PUBLIC_IP=$(curl -s --connect-timeout 5 http://169.254.169.254/opc/v1/instance/ 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('public_ip','140.245.238.96'))" 2>/dev/null || echo "140.245.238.96")
echo "Using public IP: $PUBLIC_IP"
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://140.245.238.96:8000/api/v1|g" docker-compose.yml

echo "=== [6/7] Opening OS firewall ports ==="
sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=8000/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=22/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true
sudo iptables -I INPUT 6 -p tcp --dport 3000 -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT 6 -p tcp --dport 8000 -j ACCEPT 2>/dev/null || true

echo "=== [7/7] Building and starting Docker containers ==="
sudo docker-compose down 2>/dev/null || true
sudo docker-compose build --no-cache
sudo docker-compose up -d

echo ""
echo "========================================="
echo "  DEPLOYMENT COMPLETE!"
echo "========================================="
echo "  Frontend : http://140.245.238.96:3000"
echo "  Backend  : http://140.245.238.96:8000/api/v1"
echo "  Health   : http://140.245.238.96:8000/api/v1/health"
echo "========================================="
sudo docker-compose ps
