![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/cicd.yml/badge.svg)
![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/code-review.yml/badge.svg)

# GomGomDiary Backend
> 바쁜 일상 속 사랑하는 누군가에 대해 곰곰이 고민하는 시간을 주는 GomGomDiary입니다.

## Project Architecuture
![image](https://github.com/GomGomDiary/GomGomBack/assets/75563378/665dcfcb-b32a-49d5-b70e-3c5aa064c34a)

## 기술 스택
<img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=NestJS&logoColor=white"><img src="https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white"><img src="https://img.shields.io/badge/Amazon ECS-FF9900?style=for-the-badge&logo=amazon ecs&logoColor=white"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">

- NodeJS ( Typescript )
	- NestJS
	- [express](https://github.com/GomGomDiary/GomGomBack/tree/feature/express) ( 프로토타입 구축 시 사용했었습니다. )
- MongoDB ( [Atlas로 사용 중 입니다.](https://www.mongodb.com/cloud/atlas/) )
- [AWS ECS](https://aws.amazon.com/ecs/)

## Prerequisites
- Docker (20.10.14)
- docker-compose (1.29.2)
- Node.js [v18.8.0](https://github.com/GomGomDiary/GomGomBack/blob/main/.tool-versions) or higher
- NestJS CLI v9.1.8
	- v10 이상에서 사용시 vim 에디터에 문제가 생겨 다운그레이드 시켰습니다.

## Installation

1. Clone the repository:

2. touch `.env.[development | test]` file, and fill.

	[`.env.example`](https://github.com/GomGomDiary/GomGomBack/blob/main/.env.example) 참고해주세요.

3. run docker compose using [docker-development.sh](https://github.com/GomGomDiary/GomGomBack/blob/main/docker-development.sh)
	
	매번 docker-compose 명령어를 입력하는게 귀찮아 `alias`를 사용했다가, 이마저도 불편해서 쉘스크립트를 만들었습니다.

	아래 명령어를 참고해주세요.
	```
	$ bash docker-development.sh
	```
	or
	```
	$ chmod 744 docker-development.sh; ./docker-development.sh
	```
## 주의 사항
### 환경 변수
개발 시 환경변수가 업데이트 될 수 있습니다. 이 때, 아래 룰을 따라주세요.
- `.env.development`, `.env.test`, `.env.example`에 field를 추가시켜주세요.
- `docker-compose.test.yaml`에 environment를 추가시켜주세요.
- `.env.development`는 개발 시, `.env.test`는 로컬에서 테스트를 돌릴 시, `docker-compose.test.yaml`은 CI에서 필요합니다.
>  `JWT secret`과 같은 secret 중요도가 높은 변수라면...
- [aws secret manager](https://ap-northeast-2.console.aws.amazon.com/secretsmanager)에 키 값을 추가해주세요
- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서 [secrets](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L28)를 업데이트 해주세요.
> `PORT`와 같은 secret 중요도가 낮은 변수라면...
- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서 [environment](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L16)를 업데이트 해주세요.

## Contribution rule

### Pull Request
1. 해당 프로젝트를 fork합니다.
2. 새 브랜치를 만들어주세요. ( `git checkout -b feature/fooBar` )
3. 작업 후 푸쉬한 다음 해당 프로젝트로 PR을 보내주세요.
   
### commit form
- [.gitmessage.txt](https://github.com/GomGomDiary/GomGomBack/blob/main/.gitmessage.txt)를 참고해주세요.
	- 아래 명령어는 커밋 시 템플릿을 사용할 수 있게 해줍니다.
		```example
		$ git config commit.template .gitmessage.txt
		```
	- 템플릿 적용 테스트는 아래 명령어를 입력해주세요.
		```
		$ git commit --allow-empty
		```

## Deployment

main branch에 push가 일어나고, 해당 커밋의 변경 사항이 `src` 디렉토리에서 일어났으면 ECS로 배포됩니다. [참고](https://github.com/GomGomDiary/GomGomBack/blob/main/.github/workflows/cicd.yml#L5)

성공 / 실패에 대한 상태는 github action이 webhook으로 discord에 쏴줍니다.

> 성공
<img width="291" alt="image" src="https://github.com/GomGomDiary/GomGomBack/assets/75563378/e537a7dc-454d-4e9d-8f12-6fd373f90ecf">

> 실패
<img width="291" alt="image" src="https://github.com/GomGomDiary/GomGomBack/assets/75563378/fd9cfc75-b6cd-4c05-8b79-39697b203a0a">

## TIL
개발하며 배우고 정리한 지식들은 [여기에](https://scarce-oregano-95f.notion.site/GomGomDiary-TIL-eed52cb0941646ae8e75971716017dcc?pvs=4) 정리했습니다.
