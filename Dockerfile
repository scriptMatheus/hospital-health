FROM node:18

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

COPY . /app

RUN mkdir -p /app/assets/temp/

# RUN npm install yarn --global

RUN yarn install 

ENV TZ=America/Sao_Paulo

CMD ["yarn", "dev"]

