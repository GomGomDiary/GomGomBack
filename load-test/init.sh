#!/bin/bash

system=$(uname -s)

if [ "$system" == "Darwin" ]; then
	docker-compose -f docker-compose.load.yml up -d influxdb grafana tracing
else
	docker compose -f docker-compose.load.yml up -d influxdb grafana tracing
fi
