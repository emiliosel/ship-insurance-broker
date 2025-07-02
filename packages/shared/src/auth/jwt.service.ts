import { Inject, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { JwtPayload, User } from "./types";
import { SharedAuthModuleOptions } from "./auth.module";

/**
 * Service for JWT token validation and user extraction
 */
@Injectable()
export class JwtService {
  /**
   * The public key used to verify JWT tokens
   */
  private readonly publicKey: string;

  constructor(
    @Inject("AUTH_OPTIONS") private options: SharedAuthModuleOptions,
  ) {
    if (!this.options.publicKey) {
      throw new Error(
        "JWT public key is required. Please provide it in the SharedAuthModule.forRoot() options.",
      );
    }
    this.publicKey = options.publicKey;
  }

  /**
   * Validates a JWT token and returns the decoded payload
   *
   * @param token The JWT token to validate
   * @returns The decoded payload if valid, null otherwise
   */
  validateToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ["RS256"],
      }) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extracts a user from a JWT payload
   *
   * @param payload The JWT payload
   * @returns A user object
   */
  extractUserFromPayload(payload: JwtPayload): User {
    return {
      id: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      roles: payload.roles,
    };
  }
}
