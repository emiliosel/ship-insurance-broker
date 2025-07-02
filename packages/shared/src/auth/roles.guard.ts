import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator for specifying required roles for a route
 * 
 * @param roles The roles required to access the route
 * @returns The decorator
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Guard that checks if the user has the required roles
 * Must be used after JwtAuthGuard
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Checks if the user has the required roles
   * 
   * @param context The execution context
   * @returns True if the user has the required roles, false otherwise
   * @throws ForbiddenException if the user doesn't have the required roles
   */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    
    // If no roles are specified, allow access
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = JwtAuthGuard.getCurrentUser(request);

    // If no user is attached to the request, deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if the user has any of the required roles
    const hasRole = roles.some((role: string) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(`User does not have the required roles: ${roles.join(', ')}`);
    }

    return true;
  }
}
