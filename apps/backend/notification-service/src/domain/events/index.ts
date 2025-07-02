export interface EventPayloads {
  'notification.created': {
    companyId: string;
    content: string;
    // ...other properties
  };
}

export interface IMessagingService {
  emit<K extends keyof EventPayloads>(
    routingKey: K,
    data: EventPayloads[K],
  ): Promise<void>;
}
