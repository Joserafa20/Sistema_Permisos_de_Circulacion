import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { LoginDto } from '../../application/dtos/login.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RecuperarContrasenaDto } from '../../application/dtos/recuperar-contrasena.dto';
import { RestablecerContrasenaDto } from '../../application/dtos/restablecer-contrasena.dto';
import { CambiarContrasenaDto } from '../../application/dtos/cambiar-contrasena.dto';
import {
  AuthResponseDto,
  MfaRequiredResponseDto,
  RefreshResponseDto,
} from '../../application/dtos/auth-response.dto';
import { MeResponseDto } from '../../application/dtos/me-response.dto';
import {
  MfaSetupResponseDto,
  MfaActivateDto,
  MfaVerifyDto,
  MfaLoginVerifyDto,
} from '../../application/dtos/mfa.dto';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case';
import { LogoutAllUseCase } from '../../application/use-cases/logout-all/logout-all.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { RecuperarContrasenaUseCase } from '../../application/use-cases/recuperar-contrasena/recuperar-contrasena.use-case';
import { RestablecerContrasenaUseCase } from '../../application/use-cases/restablecer-contrasena/restablecer-contrasena.use-case';
import { CambiarContrasenaUseCase } from '../../application/use-cases/cambiar-contrasena/cambiar-contrasena.use-case';
import { MeUseCase } from '../../application/use-cases/me/me.use-case';
import { SetupMfaUseCase } from '../../application/use-cases/mfa/setup-mfa.use-case';
import { ActivateMfaUseCase } from '../../application/use-cases/mfa/activate-mfa.use-case';
import { DisableMfaUseCase } from '../../application/use-cases/mfa/disable-mfa.use-case';
import { VerifyMfaLoginUseCase } from '../../application/use-cases/mfa/verify-mfa-login.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { AuthUser } from '../strategies/jwt.strategy';
import { RefreshUser } from '../strategies/jwt-refresh.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly recuperarContrasenaUseCase: RecuperarContrasenaUseCase,
    private readonly restablecerContrasenaUseCase: RestablecerContrasenaUseCase,
    private readonly cambiarContrasenaUseCase: CambiarContrasenaUseCase,
    private readonly meUseCase: MeUseCase,
    private readonly setupMfaUseCase: SetupMfaUseCase,
    private readonly activateMfaUseCase: ActivateMfaUseCase,
    private readonly disableMfaUseCase: DisableMfaUseCase,
    private readonly verifyMfaLoginUseCase: VerifyMfaLoginUseCase,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────────

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada o MFA requerido',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta bloqueada' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: Request & { user: { id: string } },
  ): Promise<AuthResponseDto | MfaRequiredResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.loginUseCase.execute({ userId: req.user.id, ipAddress, userAgent });
  }

  // ── MFA — verificar en flujo de login ─────────────────────────────────────

  @Post('mfa/verificar')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  @ApiOperation({ summary: 'Verificar código MFA en flujo de login (paso 2)' })
  @ApiResponse({ status: 200, description: 'Autenticación MFA completada', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Código o token MFA inválido' })
  async verifyMfaLogin(
    @Body() dto: MfaLoginVerifyDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.verifyMfaLoginUseCase.execute({
      mfaPendingToken: dto.mfaPendingToken,
      code: dto.code,
      ipAddress,
      userAgent,
    });
  }

  // ── MFA — setup ────────────────────────────────────────────────────────────

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Iniciar configuración MFA (genera secreto TOTP y QR)' })
  @ApiResponse({ status: 200, description: 'Secreto y QR generados', type: MfaSetupResponseDto })
  async setupMfa(@CurrentUser() user: AuthUser): Promise<MfaSetupResponseDto> {
    return this.setupMfaUseCase.execute(user.id);
  }

  // ── MFA — activar ──────────────────────────────────────────────────────────

  @Post('mfa/activar')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Activar MFA con código TOTP de confirmación' })
  @ApiResponse({ status: 200, description: 'MFA activado correctamente' })
  async activateMfa(
    @Body() dto: MfaActivateDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string }> {
    return this.activateMfaUseCase.execute(user.id, dto.code);
  }

  // ── MFA — desactivar ───────────────────────────────────────────────────────

  @Delete('mfa')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar MFA (requiere código TOTP)' })
  @ApiResponse({ status: 200, description: 'MFA desactivado correctamente' })
  async disableMfa(
    @Body() dto: MfaVerifyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string }> {
    return this.disableMfaUseCase.execute(user.id, dto.code);
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({ summary: 'Cerrar sesión (revoca refresh token actual)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado o access token inválido' })
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.logoutUseCase.execute({
      refreshToken: dto.refreshToken,
      userId: user.id,
      ipAddress,
      userAgent,
    });
  }

  // ── Logout All ─────────────────────────────────────────────────────────────

  @Post('logout/all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({ summary: 'Cerrar todas las sesiones activas del usuario' })
  @ApiResponse({ status: 200, description: 'Todas las sesiones revocadas' })
  async logoutAll(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<{ message: string; revocados: number }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.logoutAllUseCase.execute({ userId: user.id, ipAddress, userAgent });
  }

  // ── Refresh ────────────────────────────────────────────────────────────────

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Renovar tokens (rotación obligatoria)' })
  @ApiResponse({ status: 200, description: 'Tokens renovados', type: RefreshResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado o revocado' })
  async refresh(
    @Body() _dto: RefreshTokenDto,
    @Req() req: Request & { user: RefreshUser },
  ): Promise<RefreshResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.refreshTokenUseCase.execute({
      userId: req.user.id,
      rawRefreshToken: req.user.rawRefreshToken,
      ipAddress,
      userAgent,
    });
  }

  // ── Recuperar contraseña ───────────────────────────────────────────────────

  @Post('recuperar-contrasena')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Solicitud procesada correctamente' })
  async recuperarContrasena(
    @Body() dto: RecuperarContrasenaDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.recuperarContrasenaUseCase.execute({ email: dto.email, ipAddress, userAgent });
  }

  // ── Restablecer contraseña ─────────────────────────────────────────────────

  @Post('restablecer-contrasena')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente' })
  async restablecerContrasena(
    @Body() dto: RestablecerContrasenaDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.restablecerContrasenaUseCase.execute({
      token: dto.token,
      nuevaContrasena: dto.nuevaContrasena,
      ipAddress,
      userAgent,
    });
  }

  // ── Cambiar contraseña ─────────────────────────────────────────────────────

  @Post('cambiar-contrasena')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  async cambiarContrasena(
    @Body() dto: CambiarContrasenaDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.cambiarContrasenaUseCase.execute({
      userId: user.id,
      contrasenaActual: dto.contrasenaActual,
      nuevaContrasena: dto.nuevaContrasena,
      ipAddress,
      userAgent,
    });
  }

  // ── Perfil ─────────────────────────────────────────────────────────────────

  @Get('me')
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido', type: MeResponseDto })
  async me(@CurrentUser() user: AuthUser): Promise<MeResponseDto> {
    return this.meUseCase.execute(user.id);
  }
}
