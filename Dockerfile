# FROM node:10.16.0-alpine

# ENV NODE_ENV production
# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN apk add --no-cache \
#     sudo \
#     curl \
#     build-base \
#     g++ \
#     libpng \
#     libpng-dev \
#     jpeg-dev \
#     pango-dev \
#     cairo-dev \
#     giflib-dev \
#     python
# RUN apk --no-cache add ca-certificates wget  && \
#     wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
#     wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.29-r0/glibc-2.29-r0.apk && \
#     apk add glibc-2.29-r0.apk && \
#     npm install canvas@2.6.0

# RUN npm install --production --silent && mv node_modules ../
FROM node:13
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production --silent
COPY . .
EXPOSE 5000
CMD npm start
