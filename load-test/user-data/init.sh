#!/bin/bash
# Install docker
echo "=========================="
echo "===== Update package ====="
echo "=========================="
apt-get update

echo "=========================="
echo "===== Install docker ====="
echo "=========================="
apt-get install -y cloud-utils apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
apt-get update
apt-get install -y docker-ce
usermod -aG docker ubuntu

echo "==========================="
echo "===== Install compose ====="
echo "==========================="
# Install docker-compose
curl -L https://github.com/docker/compose/releases/download/1.21.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "==========================="
echo "===== Success install ====="
echo "==========================="
