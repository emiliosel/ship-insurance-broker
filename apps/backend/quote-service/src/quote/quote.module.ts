import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { QuoteRequest } from '../domain/quote-request.entity';
import { ResponderAssignment } from '../domain/responder-assignment.entity';
import { QuoteRequestRepository } from './repositories/quote-request.repository';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteRequest, ResponderAssignment]),
    RabbitMQModule,
  ],
  controllers: [QuoteController],
  providers: [QuoteService, QuoteRequestRepository],
  exports: [QuoteService],
})
export class QuoteModule {}
