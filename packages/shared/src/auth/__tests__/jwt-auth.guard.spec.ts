import { JwtAuthGuard } from "../jwt-auth.guard";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "../jwt.service";
import { Reflector } from "@nestjs/core";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = {
      validateToken: jest.fn(),
      extractUserFromPayload: jest.fn(),
    } as unknown as JwtService;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    guard = new JwtAuthGuard(jwtService, reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow access for public routes", () => {
    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it("should throw UnauthorizedException when authorization header is missing", () => {
    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token is invalid", () => {
    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: "Bearer invalid-token",
          },
        }),
      }),
    } as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.validateToken as jest.Mock).mockReturnValue(null);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it("should attach user to request when token is valid", () => {
    const mockRequest: { headers: { authorization: string }; user?: any } = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const mockPayload = { sub: "123", companyId: "457" };
    const mockUser = { id: "123", companyId: "457" };

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.validateToken as jest.Mock).mockReturnValue(mockPayload);
    (jwtService.extractUserFromPayload as jest.Mock).mockReturnValue(mockUser);

    expect(guard.canActivate(mockContext)).toBe(true);
    expect(mockRequest.user).toEqual(mockUser);
  });
});
