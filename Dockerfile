FROM node:16.13.1

WORKDIR /endbot

COPY ./package.json ./yarn.lock ./

COPY ./tsconfig.json ./

COPY ./src/ /endbot/src/

RUN yarn install

RUN yarn build

COPY . .

USER node

CMD ["yarn", "start"]
