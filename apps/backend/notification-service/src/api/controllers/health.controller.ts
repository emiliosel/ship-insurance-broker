import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@quote-system/shared';
import { ConfigService } from '@nestjs/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({
    status: 200,
    description: 'Service and dependencies status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', format: 'date-time' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'ok' },
            rabbitmq: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  async check() {
    const checks = {
      database: 'unknown',
      rabbitmq: 'unknown',
    };

    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      // Check RabbitMQ connection
      if (this.amqpConnection.connected) {
        checks.rabbitmq = 'ok';
      } else {
        checks.rabbitmq = 'error';
      }
    } catch {
      checks.rabbitmq = 'error';
    }

    return {
      status: Object.values(checks).every((status) => status === 'ok')
        ? 'ok'
        : 'error',
      version: this.configService.get<string>('VERSION', '1.0.0'),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
