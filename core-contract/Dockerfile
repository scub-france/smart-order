FROM node:carbon
ADD . /opt/workdir/app
WORKDIR /opt/workdir/app
RUN apt-get update \
 && apt-get install netcat -y
RUN npm i -g truffle && npm i
COPY ./startup/wait-for-ganache.sh /opt/workdir/startup/
RUN chmod +x /opt/workdir/startup/wait-for-ganache.sh
ENTRYPOINT truffle migrate --reset --network testnet