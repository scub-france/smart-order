FROM node
WORKDIR /usr/src/app/ethereum-bridge
RUN apt-get update \
 && apt-get install build-essential git netcat -y
RUN git clone https://github.com/oraclize/ethereum-bridge.git /usr/src/app/ethereum-bridge
RUN git reset --hard ${ETHEREUM_BRIDGE_COMMIT:-HEAD}
RUN npm i