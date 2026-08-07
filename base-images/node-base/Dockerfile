FROM node:20-alpine

# Common tooling and security hardening shared across all Node-based services
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /usr/src/app

# Ensure the working directory is owned by the non-root user
RUN chown -R appuser:appgroup /usr/src/app

USER appuser

ENTRYPOINT ["dumb-init", "--"]