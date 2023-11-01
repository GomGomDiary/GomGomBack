#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ ! -f ".env.production" ]; then
	echo -e "${RED}.env.production does not exists${NC}";
	exit 1
fi

docker build -t gomgom_production_image .

if [ $? -ne 0 ]; then
	echo -e "${RED}Failed to build gomgom_production_image${NC}";
	exit 1;
fi

docker run --name gomgom_production_container -d -it -p 8765:8765 --env-file ./.env.production gomgom_production_image;

if [ $? -ne 0 ]; then
	echo "${RED}Failed to start gomgom_production_container${NC}";
	exit 1;
fi

sleep 10;

curl localhost:8765/

if [ $? -ne 0 ]; then
	echo "${RED}Failed to connect to gomgom_production_container${NC}";
	exit 1;
fi

echo "${GREEN}gomgom_production_container is running${NC}"
fi

echo "gomgom_production_container is running"
