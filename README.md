

# GomGomBack

<!-- [![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/build.yml/badge.svg)](https://github.com/your-username/your-repo-name/actions/workflows/build.yml) -->
<!-- ![Build Status](https://github.com/GomGomDiary/GomGomBack/actions/workflows/main.yml/badge.svg?branch=feature-1) -->

- Node (Typescript, NestJS)
- MongoDB
- Railway

## Prerequisites

- Node.js [v18.8.0](https://github.com/GomGomDiary/GomGomBack/blob/main/.tool-versions) or higher
- NestJS CLI v9.1.8 or higher

## Installation

1. Clone the repository:

```bash
git clone https://github.com/GomGomDiary/GomGomBack.git
```

2. Install the dependencies:

```bash
cd GomGomBack
npm install
```

3. fill `.env.[production | development]` file

See the [`.env.example`](https://github.com/GomGomDiary/GomGomBack/blob/main/.env.example).

For reference, there is no difference between `.env.development`, `.env.production files`.

## Contribution rule

- refer to [.gitmessage.txt](https://github.com/GomGomDiary/GomGomBack/blob/main/.gitmessage.txt)

The command below will be helpful when commit.

```example
git config commit.template .gitmessage.txt
```
- push to **develop** or **feature** branch, not main

- also, pull request targets **develop** branch


## Deployment

This project is deployed by [Railway](https://railway.app/).
