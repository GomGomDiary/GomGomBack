#!/bin/bash

DEVELOP_CONTAINER=$(docker ps | grep gomgom_develop)
DEVELOP_CONTAINER_ID=`echo ${DEVELOP_CONTAINER} | awk '{print $1}'`

if [ -z "${DEVELOP_CONTAINER}" ]; then
	echo "gomgom_develop container is not running";
	docker-compose -p gomgom up -d
else
	echo "gomgom_develop container(${DEVELOP_CONTAINER_ID}) is running. Stop it? [y/n]";
	read answer
	if [ ${answer} = "y" ]; then
		docker-compose -p gomgom down -v
	else
		docker logs -f ${DEVELOP_CONTAINER_ID}
	fi
fi
