import { Module } from '@nestjs/common';
// import { AuthController } from './keycloak.controller';
// import { AuthService } from './keycloak.service';
require('dotenv').config(); 
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    //   Get details from auth admin.
    KeycloakConnectModule.register({
      authServerUrl: process.env.AUTH_SERVER_URL,
      realm: process.env.AUTH_REALM,
      clientId: process.env.AUTH_CLIENTID,
      secret: process.env.AUTH_CLIENT_SECRET,
      bearerOnly: true, // need to set this for APIs
      public: false,
      verifyTokenAudience: true,
      logLevels: ['verbose','log','debug','error','warn'],
    }),
  ],
  controllers: [],
  providers: [
    
    // This adds a global level authentication guard,
    // you can also have it scoped
    // if you like.
    //
    // Will return a 401 unauthorized when it is unable to
    // verify the JWT token or Bearer header is missing.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // This adds a global level resource guard, which is permissive.
    // Only controllers annotated with @Resource and 
    // methods with @Scopes
    // are handled by this guard.
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    // New in 1.1.0
    // This adds a global level role guard, which is permissive.
    // Used by `@Roles` decorator with the 
    // optional `@AllowAnyRole` decorator for allowing any
    // specified role passed.
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },

  ],
})
export class AuthModule {}