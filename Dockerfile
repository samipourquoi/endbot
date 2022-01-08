FROM node:16.13.1

WORKDIR /endbot

# Copy everything into docker
COPY . .

# Install the dependencies needed
RUN yarn install

RUN yarn build

CMD ["yarn", "start"]
