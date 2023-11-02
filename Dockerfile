FROM node:18

WORKDIR /var/www
COPY package.json ./
COPY yarn.lock ./
COPY ./tsconfig.json ./
COPY ./.env ./

RUN yarn

COPY ./bin ./bin
RUN mkdir db
RUN yarn setup

COPY ./src ./src

CMD ["yarn", "dev"]
