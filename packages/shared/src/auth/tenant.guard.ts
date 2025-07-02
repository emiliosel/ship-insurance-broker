import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Guard that enforces tenant isolation
 * Must be used after JwtAuthGuard
 */
@Injectable()
export class TenantGuard implements CanActivate {
  /**
   * Checks if the user has access to the requested tenant resource
   * 
   * @param context The execution context
   * @returns True if the user has access to the requested tenant resource, false otherwise
   * @throws ForbiddenException if the user doesn't have access to the requested tenant resource
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = JwtAuthGuard.getCurrentUser(request);

    // If no user is attached to the request, deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get the tenant ID from the request parameters
    const tenantId = this.extractTenantId(request);

    // If no tenant ID is found, allow access (not a tenant-specific resource)
    if (!tenantId) {
      return true;
    }

    // Check if the user belongs to the requested tenant
    if (user.companyId !== tenantId) {
      throw new ForbiddenException('Access to this tenant resource is forbidden');
    }

    return true;
  }

  /**
   * Extracts the tenant ID from the request
   * Override this method in a subclass to customize how the tenant ID is extracted
   * 
   * @param request The request object
   * @returns The tenant ID if found, undefined otherwise
   */
  protected extractTenantId(request: any): string | undefined {
    // Try to get the tenant ID from the request parameters
    if (request.params && request.params.tenantId) {
      return request.params.tenantId;
    }

    // Try to get the tenant ID from the request body
    if (request.body && request.body.tenantId) {
      return request.body.tenantId;
    }

    // Try to get the tenant ID from the request query
    if (request.query && request.query.tenantId) {
      return request.query.tenantId;
    }

    return undefined;
  }
}
