FROM node:wheezy
WORKDIR /srv/kafkaesq
COPY ./package.json /srv/kafkaesq
RUN npm install -q
CMD npm test
