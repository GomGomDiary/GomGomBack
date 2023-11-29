#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}"
ls $PWD/k6/scripts
echo -e "${NC}"

echo "Which script do you want to run?"
read answer
docker compose -f docker-compose.load.yml run -v $PWD/k6/scripts:/scripts k6 run /scripts/${answer}
