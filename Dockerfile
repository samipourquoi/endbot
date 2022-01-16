FROM node:16.13.1

WORKDIR /endbot

# Copy the needed files into docker
COPY ./package.json ./yarn.lock ./tsconfig.json ./

COPY ./src ./src

# Install the dependencies needed
RUN yarn install

RUN yarn build

# Copy everything else into docker
COPY . .

CMD ["yarn", "start"]
