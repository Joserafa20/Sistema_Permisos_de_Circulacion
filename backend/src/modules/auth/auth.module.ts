import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsuarioEntity } from '../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from './infrastructure/persistence/token.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { LocalAuthGuard } from './infrastructure/guards/local-auth.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout/logout.use-case';
import { LogoutAllUseCase } from './application/use-cases/logout-all/logout-all.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token/refresh-token.use-case';
import { RecuperarContrasenaUseCase } from './application/use-cases/recuperar-contrasena/recuperar-contrasena.use-case';
import { RestablecerContrasenaUseCase } from './application/use-cases/restablecer-contrasena/restablecer-contrasena.use-case';
import { CambiarContrasenaUseCase } from './application/use-cases/cambiar-contrasena/cambiar-contrasena.use-case';
import { MeUseCase } from './application/use-cases/me/me.use-case';
import { SetupMfaUseCase } from './application/use-cases/mfa/setup-mfa.use-case';
import { ActivateMfaUseCase } from './application/use-cases/mfa/activate-mfa.use-case';
import { DisableMfaUseCase } from './application/use-cases/mfa/disable-mfa.use-case';
import { VerifyMfaLoginUseCase } from './application/use-cases/mfa/verify-mfa-login.use-case';

import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule,
    AuditoriaModule,
    NotificacionesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') as string,
        signOptions: { expiresIn: 900 },
      }),
    }),
    TypeOrmModule.forFeature([TokenEntity, UsuarioEntity]),
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
    LoginUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    RefreshTokenUseCase,
    RecuperarContrasenaUseCase,
    RestablecerContrasenaUseCase,
    CambiarContrasenaUseCase,
    MeUseCase,
    SetupMfaUseCase,
    ActivateMfaUseCase,
    DisableMfaUseCase,
    VerifyMfaLoginUseCase,
  ],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
