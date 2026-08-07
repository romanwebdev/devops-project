FROM node:20-alpine

# Common tooling and security hardening shared across all Node-based services
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /usr/src/app

# Run as non-root by default; individual Dockerfiles can override if needed
USER appuser

ENTRYPOINT ["dumb-init", "--"]