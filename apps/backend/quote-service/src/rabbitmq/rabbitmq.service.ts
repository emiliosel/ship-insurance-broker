import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('QUOTE_SERVICE') private readonly client: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async emit(pattern: string, data: any) {
    return this.client.emit(pattern, data).toPromise();
  }
}
