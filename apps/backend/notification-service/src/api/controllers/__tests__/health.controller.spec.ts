import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { ConfigService } from '@nestjs/config';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DataSource } from 'typeorm';

interface HealthCheckResult {
  status: string;
  version: string;
  timestamp: string;
  checks: {
    database: string;
    rabbitmq: string;
  };
}

describe('HealthController', () => {
  let controller: HealthController;
  let amqpConnection: AmqpConnection;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1.0.0'),
          },
        },
        {
          provide: AmqpConnection,
          useValue: {
            connected: true,
          },
        },
        {
          provide: DataSource,
          useValue: {
            query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all dependencies are up', async () => {
      const result = (await controller.check()) as HealthCheckResult;

      expect(result).toEqual({
        status: 'ok',
        version: '1.0.0',
        timestamp: expect.any(String) as unknown as string,
        checks: {
          database: 'ok',
          rabbitmq: 'ok',
        },
      });
    });

    it('should return error status when database is down', async () => {
      jest.spyOn(dataSource, 'query').mockRejectedValueOnce(new Error());

      const result = (await controller.check()) as HealthCheckResult;

      expect(result.status).toBe('error');
      expect(result.checks.database).toBe('error');
      expect(result.checks.rabbitmq).toBe('ok');
    });

    it('should return error status when rabbitmq is down', async () => {
      Object.defineProperty(amqpConnection, 'connected', {
        get: () => false,
      });

      const result = (await controller.check()) as HealthCheckResult;

      expect(result.status).toBe('error');
      expect(result.checks.database).toBe('ok');
      expect(result.checks.rabbitmq).toBe('error');
    });
  });
});
