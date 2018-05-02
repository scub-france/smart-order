FROM node:carbon
RUN npm -g config set user root
COPY package*.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /opt/workdir/app && cp -a /tmp/node_modules /opt/workdir/app/
WORKDIR /opt/workdir/app
COPY . /opt/workdir/app
COPY ./startup/wait-for-it.sh /opt/workdir/startup/
RUN chmod +x /opt/workdir/startup/wait-for-it.sh
EXPOSE 4200
