FROM library/node:9.11.1-alpine

LABEL "maintainer"="Chris Diehl <cultclassik@gmail.com>"

ENV TIMER="5000"
ENV MINERS="localhost:3333"
ENV INFLUX_DB="minerstats"
ENV INFLUX_HOST="influx_mine.diehlabs.lan"
ENV INFLUX_USER="influx-user"
ENV INFLUX_PASS="influx-pass"

RUN mkdir /app

COPY /app/* /app/

WORKDIR /app

RUN npm install

CMD node app.js
