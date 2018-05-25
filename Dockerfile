FROM library/node:9.11.1-alpine

LABEL "maintainer"="Chris Diehl <cultclassik@gmail.com>"

ENV TIMER="5000"
ENV MINERS="localhost:3333"

ADD . /app

WORKDIR /app

RUN npm i

CMD node index.js
