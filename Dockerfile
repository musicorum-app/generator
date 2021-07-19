FROM node:13
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4030
CMD npm start
