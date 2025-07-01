import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queues: {
    quoteCreated: 'quote.created',
    quoteResponded: 'quote.responded',
    quoteAccepted: 'quote.accepted',
    quoteCancelled: 'quote.cancelled',
  },
  exchanges: {
    quotes: 'quotes.exchange',
    notifications: 'notifications.exchange',
    audit: 'audit.exchange',
  },
  retryAttempts: 3,
  retryDelay: 3000, // 3 seconds
  prefetchCount: 1,
}));
