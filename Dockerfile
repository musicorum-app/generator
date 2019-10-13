FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk add --no-cache --virtual .health-check curl \
	&& apk add --no-cache --virtual .build-deps git build-base g++ \
	&& apk add --no-cache --virtual .npm-deps cairo-dev libjpeg-turbo-dev pango
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 5000
CMD npm start