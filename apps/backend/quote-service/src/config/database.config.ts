import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Runtime validation for required environment variables
  const host = process.env.DB_HOST ?? 'localhost';
  const port = parseInt(process.env.DB_PORT ?? '5432', 10);
  const username = process.env.DB_USERNAME ?? 'postgres';
  const password = process.env.DB_PASSWORD ?? 'postgres';
  const name = process.env.DB_NAME ?? 'quote_service_db';
  const synchronize = process.env.DB_SYNC === 'true';

  return {
    host,
    port,
    username,
    password,
    name,
    synchronize,
  };
});
