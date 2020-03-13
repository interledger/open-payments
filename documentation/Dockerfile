FROM node:lts-slim

WORKDIR /usr/src/app

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

RUN npm install -g serve

EXPOSE 5000

CMD [ "serve", "build" ]