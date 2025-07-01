export interface IMessagingService {
  emit(event: string, data: any): Promise<void>;
}
