export class QuoteRequestNotFoundException extends Error {
  constructor(id: string) {
    super(`Quote request with ID ${id} not found`);
    this.name = 'QuoteRequestNotFoundException';
  }
}

export class ResponderNotFoundException extends Error {
  constructor(requestId: string, responderId: string) {
    super(`Responder ${responderId} not found in quote request ${requestId}`);
    this.name = 'ResponderNotFoundException';
  }
}

export class InvalidQuoteRequestStateException extends Error {
  constructor(requestId: string, currentState: string, requiredState: string) {
    super(
      `Quote request ${requestId} is in ${currentState} state, but ${requiredState} is required`,
    );
    this.name = 'InvalidQuoteRequestStateException';
  }
}

export class InvalidResponderStateException extends Error {
  constructor(
    responderId: string,
    currentState: string,
    requiredState: string,
  ) {
    super(
      `Responder ${responderId} is in ${currentState} state, but ${requiredState} is required`,
    );
    this.name = 'InvalidResponderStateException';
  }
}

export class QuoteRequestAlreadyFinalizedException extends Error {
  constructor(requestId: string) {
    super(`Quote request ${requestId} has already been finalized`);
    this.name = 'QuoteRequestAlreadyFinalizedException';
  }
}

export class InvalidResponderAssignmentException extends Error {
  constructor(responderId: string, requestId: string) {
    super(
      `Responder ${responderId} is not assigned to quote request ${requestId}`,
    );
    this.name = 'InvalidResponderAssignmentException';
  }
}

export class DuplicateResponderException extends Error {
  constructor(responderId: string) {
    super(`Responder ${responderId} is already assigned to this quote request`);
    this.name = 'DuplicateResponderException';
  }
}

export class NoResponseSubmittedException extends Error {
  constructor(responderId: string) {
    super(`No response submitted by responder ${responderId}`);
    this.name = 'NoResponseSubmittedException';
  }
}

export class QuoteResponseAlreadySubmittedException extends Error {
  constructor(responderId: string) {
    super(`Response already submitted by responder ${responderId}`);
    this.name = 'QuoteResponseAlreadySubmittedException';
  }
}
