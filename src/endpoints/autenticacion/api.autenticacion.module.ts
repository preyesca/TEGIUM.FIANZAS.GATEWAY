import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SharedServicesModule } from 'src/app/services/services.module';
import { AdministracionModule } from 'src/modules/administracion/administracion.module';
import { AutenticacionModule } from 'src/modules/autenticacion/autenticacion.module';
import { CatalogoModule } from 'src/modules/catalogo/catalogo.module';
import { CoreModule } from 'src/modules/core/core.module';
import { AuthLoginController } from './api/auth.login.controller';
import { AuthSesionMfaController } from './api/auth.sesion-mfa.controller';
import { AuthSesionUsuarioController } from './api/auth.sesion-usuario.controller';
import { AuthTokenController } from './api/auth.token.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('MSH_JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('MSH_JWT_EXPIRES_IN'),
          audience: config.get('MSH_JWT_URL'),
        },
      }),
    }),

    AdministracionModule,
    AutenticacionModule,
    CatalogoModule,
    CoreModule,
    // ExpedienteModule,
    SharedServicesModule,
  ],
  providers: [AuthTokenController],
  controllers: [
    AuthLoginController,
    AuthTokenController,
    AuthSesionUsuarioController,
    AuthSesionMfaController,
  ],
})
export class ApiAutenticacionModule {}
