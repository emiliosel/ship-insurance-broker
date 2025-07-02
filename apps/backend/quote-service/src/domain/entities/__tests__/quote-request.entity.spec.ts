import { QuoteRequest } from '../quote-request.entity';
import {
  VoyageData,
  QuoteRequestStatus,
  CargoType,
  VesselType,
  ResponseStatus,
} from '../../types';
import {
  InvalidQuoteRequestStateException,
  QuoteRequestAlreadyFinalizedException,
  ResponderNotFoundException,
} from '../../exceptions';

describe('QuoteRequest', () => {
  let quoteRequest: QuoteRequest;
  const sampleVoyageData: VoyageData = {
    departurePort: {
      code: 'PORTA',
      name: 'Port A',
    },
    destinationPort: {
      code: 'PORTB',
      name: 'Port B',
    },
    cargoType: CargoType.CONTAINER,
    cargoWeight: 100,
    vesselType: VesselType.CONTAINER_SHIP,
    departureDate: new Date(),
  };

  beforeEach(() => {
    quoteRequest = new QuoteRequest();
    quoteRequest.id = 'test-id';
    quoteRequest.requesterId = 'requester-1';
    quoteRequest.voyageData = sampleVoyageData;
    quoteRequest.status = QuoteRequestStatus.PENDING;
    quoteRequest.responderAssignments = [];
  });

  describe('addResponders', () => {
    it('should add responder assignments', () => {
      const responderIds = ['responder-1', 'responder-2'];
      quoteRequest.addResponders(responderIds);

      expect(quoteRequest.responderAssignments).toHaveLength(2);
      expect(quoteRequest.responderAssignments[0].responderId).toBe(
        'responder-1',
      );
      expect(quoteRequest.responderAssignments[1].responderId).toBe(
        'responder-2',
      );
    });
  });

  describe('acceptResponse', () => {
    beforeEach(() => {
      quoteRequest.addResponders(['responder-1', 'responder-2']);
      // Ensure responder assignments are properly initialized
      quoteRequest.responderAssignments.forEach((assignment) => {
        assignment.status = ResponseStatus.PENDING;
      });
      // Simulate response submission for responder-1
      quoteRequest.responderAssignments[0].submitResponse(1000, 'Test comment');
    });

    it('should accept response from valid responder', () => {
      quoteRequest.acceptResponse('responder-1');

      expect(quoteRequest.status).toBe(QuoteRequestStatus.ACCEPTED);
      expect(quoteRequest.responderAssignments[0].status).toBe(
        ResponseStatus.ACCEPTED,
      );
      expect(quoteRequest.responderAssignments[1].status).toBe(
        ResponseStatus.REJECTED,
      );
    });

    it('should throw error when accepting response from non-existent responder', () => {
      expect(() => quoteRequest.acceptResponse('non-existent')).toThrow(
        ResponderNotFoundException,
      );
    });

    it('should throw error when accepting response that has not been submitted', () => {
      expect(() => quoteRequest.acceptResponse('responder-2')).toThrow(
        InvalidQuoteRequestStateException,
      );
    });

    it('should throw error when quote request is already finalized', () => {
      quoteRequest.status = QuoteRequestStatus.ACCEPTED;

      expect(() => quoteRequest.acceptResponse('responder-1')).toThrow(
        QuoteRequestAlreadyFinalizedException,
      );
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      quoteRequest.addResponders(['responder-1', 'responder-2']);
    });

    it('should cancel the quote request and all assignments', () => {
      quoteRequest.cancel();

      expect(quoteRequest.status).toBe(QuoteRequestStatus.CANCELLED);
      expect(
        quoteRequest.responderAssignments.every(
          (a) => a.status === ResponseStatus.CANCELLED,
        ),
      ).toBe(true);
    });

    it('should throw error when cancelling an already finalized request', () => {
      quoteRequest.status = QuoteRequestStatus.ACCEPTED;

      expect(() => quoteRequest.cancel()).toThrow(
        QuoteRequestAlreadyFinalizedException,
      );
    });
  });

  describe('isFinalized', () => {
    it('should return true for finalized statuses', () => {
      const finalizedStatuses = [
        QuoteRequestStatus.ACCEPTED,
        QuoteRequestStatus.CANCELLED,
        QuoteRequestStatus.COMPLETED,
      ];

      finalizedStatuses.forEach((status) => {
        quoteRequest.status = status;
        expect(quoteRequest.isFinalized()).toBe(true);
      });
    });

    it('should return false for non-finalized statuses', () => {
      const nonFinalizedStatuses = [
        QuoteRequestStatus.PENDING,
        QuoteRequestStatus.RESPONDED,
      ];

      nonFinalizedStatuses.forEach((status) => {
        quoteRequest.status = status;
        expect(quoteRequest.isFinalized()).toBe(false);
      });
    });
  });
});
