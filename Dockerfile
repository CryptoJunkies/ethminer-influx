FROM library/node:9.11.1-alpine

LABEL "maintainer"="Chris Diehl <cultclassik@gmail.com>"

ADD . /app

WORKDIR /app

RUN npm i

ENTRYPOINT [ "node index.js" ]
CMD [ "localhost:3333 "]
