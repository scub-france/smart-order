FROM node:carbon
WORKDIR /opt/workdir/app/ethereum-bridge
RUN apt-get update \
 && apt-get install build-essential git netcat -y
RUN git clone https://github.com/oraclize/ethereum-bridge.git /opt/workdir/app/ethereum-bridge
RUN git reset --hard ${ETHEREUM_BRIDGE_COMMIT:-HEAD}
RUN npm i
COPY ./startup/wait-for-ganache.sh /opt/workdir/startup/
RUN chmod +x /opt/workdir/startup/wait-for-ganache.sh