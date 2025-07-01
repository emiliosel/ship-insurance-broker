import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { QuoteRequest, ResponderAssignment } from './entities/quote-request.entity';
import { QuoteRequestRepository } from './repositories/quote-request.repository';
import { ResponderAssignmentRepository } from './repositories/responder-assignment.repository';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteRequest, ResponderAssignment]),
    RabbitMQModule,
  ],
  controllers: [QuoteController],
  providers: [
    QuoteService,
    QuoteRequestRepository,
    ResponderAssignmentRepository,
  ],
  exports: [QuoteService],
})
export class QuoteModule {}
