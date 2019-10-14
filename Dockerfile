FROM mhart/alpine-node:8.5.0

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    bash \
    imagemagick

RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 5000
CMD npm start