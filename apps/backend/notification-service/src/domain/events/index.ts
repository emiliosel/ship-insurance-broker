export interface EventPayloads {
  'quote_request.created': {
    quoteRequestId: string;
    requesterId: string;
    responderIds: string[];
    // voyageData: VoyageData;
  };
  'quote_request.response_submitted': {
    quoteRequestId: string;
    responderId: string;
    price: number;
    comments: string;
  };
  'quote_request.response_accepted': {
    quoteRequestId: string;
    responderId: string;
    rejectedResponderIds: string[];
  };
  'quote_request.response_rejected': {
    quoteRequestId: string;
    responderId: string;
  };
  'quote_request.cancelled': {
    quoteRequestId: string;
    responderIds: string[];
  };
}

export interface IMessagingService {
  emit<K extends keyof EventPayloads>(
    routingKey: K,
    data: EventPayloads[K],
  ): Promise<void>;
}
