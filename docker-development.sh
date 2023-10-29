#!/bin/bash

DEVELOP_CONTAINER=$(docker ps | grep gomgom_develop)

if [ -z "${DEVELOP_CONTAINER}" ]; then
	echo "gomgom_develop container is not running";
	docker-compose -p gomgom up -d
else
	echo "gomgom_develop container is running. Stopping it.";
	docker-compose -p gomgom down -v
fi
