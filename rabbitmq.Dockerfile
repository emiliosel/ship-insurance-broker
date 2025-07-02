FROM rabbitmq:3-management-alpine

# Set permissions for the cookie file
RUN mkdir -p /var/lib/rabbitmq && \
    touch /var/lib/rabbitmq/.erlang.cookie && \
    chmod 600 /var/lib/rabbitmq/.erlang.cookie && \
    chown rabbitmq:rabbitmq /var/lib/rabbitmq/.erlang.cookie
