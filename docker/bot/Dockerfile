FROM node:12

MAINTAINER samipourquoi

WORKDIR /app

# PACKAGES DEPENDENCIES

COPY ./package.json ./yarn.lock ./

COPY ./packages/endbot/package.json ./packages/endbot/

COPY ./packages/endweb-front/package.json ./packages/endweb-front/

COPY ./packages/endweb-back/package.json ./packages/endweb-back/

RUN yarn install

# PACKAGES SOURCE CODE

COPY ./tsconfig.base.json ./

COPY ./packages/endbot ./packages/endbot/

RUN yarn workspace endbot build

COPY ./packages/endweb-front ./packages/endweb-front/

RUN yarn workspace @endweb/front build

COPY ./packages/endweb-back ./packages/endweb-back/

RUN yarn workspace @endweb/back build

# OTHER

COPY . .

ENV CONTAINER=1

ENTRYPOINT ["yarn", "start"]
