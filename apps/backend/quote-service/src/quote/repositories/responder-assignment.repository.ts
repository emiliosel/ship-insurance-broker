import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResponderAssignment } from '../entities/quote-request.entity';
import { ResponderAssignmentStatus } from '@quote-system/shared';

@Injectable()
export class ResponderAssignmentRepository {
  constructor(
    @InjectRepository(ResponderAssignment)
    private readonly repository: Repository<ResponderAssignment>,
  ) {}

  async createMany(
    quoteRequestId: string,
    responderIds: string[],
  ): Promise<ResponderAssignment[]> {
    const assignments = responderIds.map(responderId =>
      this.repository.create({
        quoteRequestId,
        responderId,
        status: ResponderAssignmentStatus.PENDING,
      }),
    );
    return this.repository.save(assignments);
  }

  async findByQuoteRequestId(quoteRequestId: string): Promise<ResponderAssignment[]> {
    return this.repository.find({
      where: { quoteRequestId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByResponderId(responderId: string): Promise<ResponderAssignment[]> {
    return this.repository.find({
      where: { responderId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: ResponderAssignmentStatus,
    premium?: number,
    comments?: string,
  ): Promise<ResponderAssignment> {
    const assignment = await this.repository.findOne({ where: { id } });
    if (!assignment) {
      throw new Error('Responder assignment not found');
    }

    assignment.status = status;
    if (premium !== undefined) assignment.premium = premium;
    if (comments !== undefined) assignment.comments = comments;

    return this.repository.save(assignment);
  }

  async findByIds(ids: string[]): Promise<ResponderAssignment[]> {
    return this.repository.find({
      where: { id: In(ids) },
    });
  }

  async findPendingByResponderId(responderId: string): Promise<ResponderAssignment[]> {
    return this.repository.find({
      where: {
        responderId,
        status: ResponderAssignmentStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
