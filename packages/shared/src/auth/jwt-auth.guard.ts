import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "./jwt.service";
import { User } from "./types";
import { IS_PUBLIC_KEY } from "./public.decorator";

/**
 * Guard that validates JWT tokens in the Authorization header
 * and attaches the user to the request object
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Validates the JWT token in the Authorization header
   * and attaches the user to the request object
   *
   * @param context The execution context
   * @returns True if the token is valid, false otherwise
   * @throws UnauthorizedException if the token is missing or invalid
   */
  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access without authentication
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer") {
      throw new UnauthorizedException("Invalid authorization type");
    }

    if (!token) {
      throw new UnauthorizedException("Token is missing");
    }

    const payload = this.jwtService.validateToken(token);

    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }

    // Attach the user to the request object
    request.user = this.jwtService.extractUserFromPayload(payload);

    return true;
  }

  /**
   * Gets the current user from the request object
   * @param request The request object
   * @returns The current user
   */
  static getCurrentUser(request: any): User {
    return request.user;
  }
}
