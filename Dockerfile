FROM node:12

MAINTAINER samipourquoi

WORKDIR /app

# PACKAGES DEPENDENCIES

COPY ./package.json ./yarn.lock ./

COPY ./packages/endbot/package.json ./packages/endbot/

RUN yarn install

# PACKAGES SOURCE CODE

COPY ./packages/endbot ./packages/endbot/

RUN yarn workspace endbot build

# OTHER

COPY . .

ENTRYPOINT ["yarn", "start"]
