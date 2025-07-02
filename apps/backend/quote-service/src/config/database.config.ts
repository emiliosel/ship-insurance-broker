import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const config = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'production',
  };

  console.log('Database Config:', {
    ...config,
    password: '***',
  });

  return config;
});
