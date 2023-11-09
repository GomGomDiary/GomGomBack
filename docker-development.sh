#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'


DEVELOP_CONTAINER=$(docker ps | grep gomgom_develop)
DEVELOP_CONTAINER_ID=`echo ${DEVELOP_CONTAINER} | awk '{print $1}'`

# .env.development file check

if [ ! -f ".env.development" ]; then
	echo -e "${RED}.env.development does not exists${NC}";
	exit 1
fi

if [ -z "${DEVELOP_CONTAINER}" ]; then
	echo "gomgom_develop container is not running";
	docker-compose -p gomgom up -d --build
else
	echo -e "${GREEN}gomgom_develop container(${DEVELOP_CONTAINER_ID}) is running.${NC} Stop it? [y/n]";
	read answer
	if [ ${answer} = "y" ]; then
		echo "gomgom_develop container is stopped";
		docker-compose -p gomgom down -v
	else
		docker logs -f ${DEVELOP_CONTAINER_ID}
	fi
fi
