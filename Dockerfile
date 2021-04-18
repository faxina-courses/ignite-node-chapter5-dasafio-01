FROM node:14.15-alpine

WORKDIR /usr/src

ENV PATH /usr/src/node_modules/.bin/:$PATH

COPY package*.json ./

RUN npm install && npm cache clean --force

WORKDIR /usr/src/app

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev"]