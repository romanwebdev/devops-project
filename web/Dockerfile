# ---- Build stage ----
FROM roman102/node-base:latest AS build

WORKDIR /usr/src/app

COPY --chown=appuser:appgroup package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80