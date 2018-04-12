FROM node
VOLUME /usr/src/app
EXPOSE 4200
WORKDIR /usr/src/app
ENTRYPOINT npm install --prefix /usr/src/app && npm run start:${ANGULAR_CLI_ENV:-rec} --prefix /usr/src/app
