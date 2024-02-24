#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

export SERVICES=sqs
export REGION=ap-northeast-2
export QUEUE_NAME=test


localstack start &

while true; do
	response=$(curl -s -o /dev/null -w "%{http_code}" localhost:4566/)
	if [ $response -eq 200 ]; then
		echo ""
		echo -e "${GREEN}$(aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name test.fifo --attributes FifoQueue=true)${NC}"
		break
	else
		echo "Waiting for localstack..."
		sleep 1;
	fi
done

LOCALSTACK_CONTAINER=$(docker ps | grep local | awk '{print $1}')

echo ""
echo "Localstack은 Docker로 켜져있습니다.(${LOCALSTACK_CONTAINER})"
echo -e "${RED}'localstack stop'${NC} 을 사용해서 종료해주세요."
