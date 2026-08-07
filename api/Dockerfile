FROM roman102/node-base:latest

WORKDIR /usr/src/app

COPY --chown=appuser:appgroup package*.json ./
RUN npm install --omit=dev

COPY --chown=appuser:appgroup . .

EXPOSE 3000

CMD ["node", "server.js"]