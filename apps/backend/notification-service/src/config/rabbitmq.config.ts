import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => {
  console.log({
    url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'quote_events',
    queue: process.env.RABBITMQ_QUEUE ?? 'quote_requests',
    prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH_COUNT ?? '1', 10),
  });

  return {
    url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'quote_events',
    queue: process.env.RABBITMQ_QUEUE ?? 'quote_requests',
    prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH_COUNT ?? '1', 10),
  };
});
