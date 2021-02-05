FROM node:13
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4030
CMD npm start
