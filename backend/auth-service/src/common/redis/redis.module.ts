import { Global, Module } from '@nestjs/common';

/**
 * Placeholder until NOX-8 migrates auth-service into backend/api.
 * Restored so monorepo typecheck can resolve AppModule imports.
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class RedisModule {}
