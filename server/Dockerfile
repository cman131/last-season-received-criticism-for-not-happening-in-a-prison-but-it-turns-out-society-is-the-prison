FROM node:alpine
COPY . /APP
WORKDIR /APP
RUN npm install
COPY --chown=node:node . .
EXPOSE 8080
CMD npm run start