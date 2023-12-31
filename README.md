![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/cicd.yml/badge.svg)
![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/code-review.yml/badge.svg)

# GomGomDiary Backend
> 바쁜 일상 속 사랑하는 누군가에 대해 곰곰이 고민하는 시간을 주는 GomGomDiary입니다.

## Project Architecuture
![image](https://github.com/GomGomDiary/GomGomBack/assets/75563378/4a18cdd8-32b1-421c-ac4b-adb56f6823f2)


## 기술 스택
### Backend

<img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=NestJS&logoColor=white"><img src="https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white">

### Database
  
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white">

### Infra
  
<img src="https://img.shields.io/badge/Amazon ECS-FF9900?style=for-the-badge&logo=amazon ecs&logoColor=white"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">


### CI/CD

<img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"><img src="https://img.shields.io/badge/github action-2088FF?style=for-the-badge&logo=github actions&logoColor=white">

### Monitoring

<img src="https://img.shields.io/badge/Honeycomb-1E8CBE?style=for-the-badge&logo=honeycomb&logoColor=white"><img src="https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=OpenTelemetry&logoColor=white"><img src="https://img.shields.io/badge/Amazon Cloudwatch-FF4F8B?style=for-the-badge&logo=Amazon Cloudwatch&logoColor=white">


### Load Testing

<img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white"><img src="https://img.shields.io/badge/k6-7D64FF?style=for-the-badge&logo=k6&logoColor=white">


## TIL
개발 기록은 [노션](https://iamyoyoo.notion.site/eed52cb0941646ae8e75971716017dcc?pvs=4)에 정리했습니다.

## Prerequisites
- Docker (20.10.14 or higher)
- docker-compose (1.29.2 or higher)
- Node.js [v18.8.0](https://github.com/GomGomDiary/GomGomBack/blob/main/.tool-versions) or higher
- NestJS CLI v9.1.8
	- v10 이상에서 사용시 vim 에디터에 문제가 생겨 다운그레이드 시켰습니다.

## Installation

1. Clone the repository.

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

## Load testing

부하 테스트에 대한 설명은 [load-test](https://github.com/GomGomDiary/GomGomBack/tree/main/load-test)에 쓰여있습니다.

## 주의 사항
### 환경 변수
개발 시 환경변수가 업데이트 될 수 있습니다. 아래 룰을 따라주세요.
1. `.env.development`, `.env.test`, `.env.example`에 field를 추가시켜주세요.
2. `docker-compose.test.yaml`에 environment를 추가시켜주세요.
> `.env.development`는 개발 시, `.env.test`는 로컬에서 e2e, 부하 테스트를 돌릴 시, `docker-compose.test.yaml`은 CI에서 필요합니다.

3-1. `JWT secret`과 같은 secret 중요도가 높은 변수라면...
- [aws secret manager](https://ap-northeast-2.console.aws.amazon.com/secretsmanager)에 키 값을 추가해주세요
- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서 [secrets](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L28)를 업데이트 해주세요.

3-2. `PORT`와 같은 secret 중요도가 낮은 변수라면...
- [task-definition.json](https://github.com/GomGomDiary/GomGomBack/blob/main/.aws/task-definition.json)에서 [environment](https://github.com/GomGomDiary/GomGomBack/blob/e72f14805213b38930ba510eac62da3268355cbd/.aws/task-definition.json#L16)를 업데이트 해주세요.

## Contribution rule

### Pull Request
1. 해당 프로젝트를 fork합니다.
2. 새 브랜치를 만들어주세요. ( ex: `git checkout -b feature/foo` )
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
<img width="291" alt="image" src="https://github.com/GomGomDiary/GomGomBack/assets/75563378/71432e71-6914-4113-a485-475be92dc5a1">
