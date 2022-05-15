# First create the base image
FROM node:16.13.1 as base

WORKDIR /endbot

# Copy the needed files into docker
COPY ./package.json ./yarn.lock ./tsconfig.json .

COPY ./src ./src

COPY ./config.yml .


# Image for production
FROM base as prod

RUN yarn install --production

RUN yarn build

CMD ["yarn", "start"]


# Image for development
FROM base as dev

RUN yarn install

RUN yarn build

COPY ./tests ./tests

CMD ["yarn", "dev"]
