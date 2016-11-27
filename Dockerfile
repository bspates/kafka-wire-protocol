FROM node:wheezy
WORKDIR /srv/kafka-wire-protocol
COPY ./package.json /srv/kafka-wire-protocol
RUN npm install -q
CMD npm test
