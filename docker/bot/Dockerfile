FROM node:12

WORKDIR /app

COPY ./package.json ./package.json

COPY ./package-lock.json ./package-lock.json

RUN npm ci

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
