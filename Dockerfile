########
# Build
########
ARG NODE_IMAGE="node:18-alpine"

FROM --platform=linux/amd64 ${NODE_IMAGE} as build

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

############
# Production
############
FROM --platform=linux/amd64 ${NODE_IMAGE} as production

WORKDIR /usr/src/app

COPY --from=build ./usr/src/app/dist ./dist
COPY --from=build ./usr/src/app/package.json ./package.json
COPY --from=build ./usr/src/app/package-lock.json ./package-lock.json

RUN npm install --only=production

CMD ["node", "dist/main"]
