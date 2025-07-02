import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "./jwt.service";

export interface SharedAuthModuleOptions {
  publicKey: string;
}

export interface SharedAuthModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  useFactory: (
    ...args: any[]
  ) => Promise<SharedAuthModuleOptions> | SharedAuthModuleOptions;
  inject?: any[];
}

/**
 * Shared auth module that provides JwtService and Reflector
 */
@Module({
  providers: [JwtService, Reflector],
  exports: [JwtService, Reflector],
})
export class SharedAuthModule {
  /**
   * Configure the SharedAuthModule
   * @param options Configuration options
   * @returns A dynamic module
   */
  static forRoot(options: SharedAuthModuleOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      providers: [
        {
          provide: "AUTH_OPTIONS",
          useValue: options,
        },
        JwtService,
        Reflector,
      ],
      exports: [JwtService, Reflector],
    };
  }

  /**
   * Configure the SharedAuthModule asynchronously
   * @param options Async configuration options
   * @returns A dynamic module
   */
  static forRootAsync(options: SharedAuthModuleAsyncOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), JwtService, Reflector],
      exports: [JwtService, Reflector],
    };
  }

  private static createAsyncProviders(
    options: SharedAuthModuleAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: "AUTH_OPTIONS",
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }
}
