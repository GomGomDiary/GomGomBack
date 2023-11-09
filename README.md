# GomGomDiary Backend

<!-- [![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/build.yml/badge.svg)](https://github.com/your-username/your-repo-name/actions/workflows/build.yml) -->
<!-- ![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/main.yml/badge.svg?branch=feature-1) -->

- NodeJS (Typescript)
	- NestJS
	- [express](https://github.com/GomGomDiary/GomGomBack/tree/feature/express) ( 프로토타입 구축 시 사용했었습니다. )
- MongoDB ([Atlas로 사용 중 입니다.](https://www.mongodb.com/cloud/atlas/))
- [AWS ECS](https://aws.amazon.com/ecs/)

## Prerequisites

- Node.js [v18.8.0](https://github.com/GomGomDiary/GomGomBack/blob/main/.tool-versions) or higher
- NestJS CLI v9.1.8
	- v10 이상에서 사용시 vim 에디터에 문제가 생겨 다운그레이드 시켰습니다.

## Installation

1. Clone the repository:

	```bash
	git clone https://github.com/GomGomDiary/GomGomBack.git
	```

2. fill `.env.[production | development | test]` file

	[`.env.example`](https://github.com/GomGomDiary/GomGomBack/blob/main/.env.example) 참고해주세요.

	`.env.development`, `.env.production`, `.env.test` 는 전부 동일한 field를 갖고 있습니다.

3. run docker compose using [docker-development.sh](https://github.com/GomGomDiary/GomGomBack/blob/main/docker-development.sh)
	
	매번 docker-compose 명령어를 입력하는게 귀찮아 `alias`를 사용했다가, 이마저도 불편해져서 쉘스크립트를 만들었습니다.

	아래 명령어를 참고해주세요.
	```
	bash docker-development.sh
	```
	or
	```
	chmod 744 docker-development.sh
	./docker-development.sh
	```
## 주의 사항
### 환경 변수
- 개발 시 환경변수가 업데이트 될 수 있습니다. 아래 룰을 따라주면 문제가 생기지 않습니다.
	- `.env.development`, `.env.test`, `.env.example`, `.env.production`에 field를 추가시켜주세요.
	- `docker-compose.test.yaml`에 environment를 추가시켜주세요.
	- `JWT secret`과 같은 secret 중요도가 높은 변수라면 아래 지침을 따라주세요.
		- [aws secret manager](https://ap-northeast-2.console.aws.amazon.com/secretsmanager)에 키 값을 추가해주세요
		- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서 [secrets](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L28)를 업데이트 해주세요.
	- `PORT`와 같은 secret 중요도가 낮은 변수라면 아래 지침을 따라주세요.
		- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서[environment](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L16)를 업데이트 해주세요.

## Contribution rule

### commit form
- [.gitmessage.txt](https://github.com/GomGomDiary/GomGomBack/blob/main/.gitmessage.txt)를 참고해주세요.
	- 아래 명령어는 템플릿을 사용할 수 있게 해줍니다.
		```example
		$ git config commit.template .gitmessage.txt
		```
	- 템플릿 적용 테스트는 아래 명령어를 입력해주세요.
		```
		$ git commit --allow-empty
		```

- push to **dev** or **feature** branch, not main

- pull request targets **dev** branch
	- pr 생성 / synchronize시


## Deployment

main branch에 push가 일어나고, 해당 커밋의 변경 사항이 `src` 디렉토리에서 일어났으면 ECS로 배포됩니다. [참고](https://github.com/GomGomDiary/GomGomBack/blob/main/.github/workflows/cicd.yml#L5)

배포가 성공, 실패했을 경우 전부 discord로 webhook을 쏴줍니다.
