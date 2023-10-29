#!/bin/bash

docker build -t gomgom_production_image .

if [ $? -ne 0 ]; then
	echo "Failed to build gomgom_production_image";
	exit 1;
fi

docker run --name gomgom_production_container -d -it -p 8765:8765 --env-file ./.env.production gomgom_production_image;

if [ $? -ne 0 ]; then
	echo "Failed to start gomgom_production_container";
	exit 1;
fi

sleep 10;

curl localhost:8765/

if [ $? -ne 0 ]; then
	echo "Failed to connect to gomgom_production_container";
	exit 1;
fi

echo "gomgom_production_container is running"
