FROM library/node:12.6.0-alpine

LABEL "maintainer"="Chris Diehl <cultclassik@gmail.com>"

ENV TIMER="5000"
ENV MINER_HOST="localhost"
ENV MINER_PORT="3333"
ENV MINER_TYPE="ethminer"
ENV INFLUX_DB="minerstats"
ENV INFLUX_HOST="influx_mine.diehlabs.lan"
ENV INFLUX_USER="influx-user"
ENV INFLUX_PASS="influx-pass"

RUN mkdir /app

COPY ./app/* /app/

WORKDIR /app

RUN npm install

CMD node app.js
