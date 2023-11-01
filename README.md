

# GomGomDiary Backend

<!-- [![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/build.yml/badge.svg)](https://github.com/your-username/your-repo-name/actions/workflows/build.yml) -->
<!-- ![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/main.yml/badge.svg?branch=feature-1) -->

- NodeJS (Typescript)
	- NestJS
	- [express](https://github.com/GomGomDiary/GomGomBack/tree/feature/express) ( use in the past... )
- MongoDB ([Atlas](https://www.mongodb.com/cloud/atlas/))
- [AWS ECS](https://aws.amazon.com/ecs/)

## Prerequisites

- Node.js [v18.8.0](https://github.com/GomGomDiary/GomGomBack/blob/main/.tool-versions) or higher
- NestJS CLI v9.1.8 or higher

## Installation

1. Clone the repository:

```bash
git clone https://github.com/GomGomDiary/GomGomBack.git
```

2. fill `.env.[production | development]` file

See the [`.env.example`](https://github.com/GomGomDiary/GomGomBack/blob/main/.env.example).

For reference, there is no difference field between `.env.development`, `.env.production`.

3. run docker compose using [docker-development.sh](https://github.com/GomGomDiary/GomGomBack/blob/main/docker-development.sh)
```
bash docker-development.sh
```
or
```
chmod 744 docker-development.sh
./docker-development.sh
```



## Contribution rule

- refer to [.gitmessage.txt](https://github.com/GomGomDiary/GomGomBack/blob/main/.gitmessage.txt)

	- The below command may be helpful when commit.

	```example
	$ git config commit.template .gitmessage.txt
	```
	- Test 
	```
	$ git commit --allow-empty
	```

- push to **develop** or **feature** branch, not main

- Also, pull request targets **develop** branch


## Deployment

This project is deployed by [ECS](https://aws.amazon.com/ecs).
