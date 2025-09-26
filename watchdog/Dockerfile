FROM alpine:latest

# Install Docker CLI and dependencies
RUN apk add --no-cache \
    docker-cli \
    bash \
    curl \
    jq \
    grep \
    && rm -rf /var/cache/apk/*

# Create watchdog user for better security
RUN addgroup -g 1001 watchdog && \
    adduser -D -u 1001 -G watchdog watchdog

# Create log directory
RUN mkdir -p /var/log/watchdog && \
    chown -R watchdog:watchdog /var/log/watchdog

# Copy watchdog script
COPY watchdog.sh /usr/local/bin/watchdog.sh
RUN chmod +x /usr/local/bin/watchdog.sh

# Set environment defaults
ENV MONITORED_CONTAINER="ollama-proxy-ollama-1" \
    CHECK_INTERVAL="5" \
    RESTART_COOLDOWN="60" \
    LOG_LEVEL="INFO"

# Switch to non-root user
USER watchdog

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f "watchdog.sh" > /dev/null || exit 1

# Start watchdog
CMD ["/usr/local/bin/watchdog.sh"]