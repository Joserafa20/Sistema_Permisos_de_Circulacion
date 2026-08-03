import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { UsuarioEntity } from '../usuarios/infrastructure/persistence/usuario.entity';
import { AuditoriaRegistroEntity } from '../auditoria/infrastructure/persistence/auditoria-registro.entity';
import { TokenEntity } from './infrastructure/persistence/token.entity';

import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { LocalAuthGuard } from './infrastructure/guards/local-auth.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token/refresh-token.use-case';
import { RecuperarContrasenaUseCase } from './application/use-cases/recuperar-contrasena/recuperar-contrasena.use-case';
import { RestablecerContrasenaUseCase } from './application/use-cases/restablecer-contrasena/restablecer-contrasena.use-case';
import { CambiarContrasenaUseCase } from './application/use-cases/cambiar-contrasena/cambiar-contrasena.use-case';
import { MeUseCase } from './application/use-cases/me/me.use-case';

import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') as string,
        // Access token: 15 minutos en segundos
        signOptions: { expiresIn: 900 },
      }),
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 900000, limit: 5 }]),
    TypeOrmModule.forFeature([TokenEntity, UsuarioEntity, AuditoriaRegistroEntity]),
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
    RefreshTokenUseCase,
    RecuperarContrasenaUseCase,
    RestablecerContrasenaUseCase,
    CambiarContrasenaUseCase,
    MeUseCase,
  ],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
