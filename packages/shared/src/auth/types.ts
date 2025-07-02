/**
 * Represents the payload structure of a JWT token
 */
export interface JwtPayload {
  /**
   * Unique identifier for the user
   */
  sub: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Company ID the user belongs to (for tenant isolation)
   */
  companyId: string;

  /**
   * User's roles (e.g., 'requester', 'responder', 'admin')
   */
  roles: string[];

  /**
   * Token issued at timestamp
   */
  iat?: number;

  /**
   * Token expiration timestamp
   */
  exp?: number;
}

/**
 * Represents a user with authentication and authorization details
 */
export interface User {
  /**
   * Unique identifier for the user
   */
  id: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Company ID the user belongs to (for tenant isolation)
   */
  companyId: string;

  /**
   * User's roles (e.g., 'requester', 'responder', 'admin')
   */
  roles: string[];
}
