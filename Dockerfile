FROM node:18

WORKDIR /var/www
COPY package.json ./
COPY yarn.lock ./
COPY ./tsconfig.json ./
COPY ./.env ./

RUN yarn

COPY ./bin ./bin
RUN yarn setup

COPY ./src ./src
COPY ./index.ts ./

CMD ["yarn", "ts-start"]
