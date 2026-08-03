import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { LoginDto } from '../../application/dtos/login.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RecuperarContrasenaDto } from '../../application/dtos/recuperar-contrasena.dto';
import { RestablecerContrasenaDto } from '../../application/dtos/restablecer-contrasena.dto';
import { CambiarContrasenaDto } from '../../application/dtos/cambiar-contrasena.dto';
import { AuthResponseDto, RefreshResponseDto } from '../../application/dtos/auth-response.dto';
import { MeResponseDto } from '../../application/dtos/me-response.dto';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
import { RecuperarContrasenaUseCase } from '../../application/use-cases/recuperar-contrasena/recuperar-contrasena.use-case';
import { RestablecerContrasenaUseCase } from '../../application/use-cases/restablecer-contrasena/restablecer-contrasena.use-case';
import { CambiarContrasenaUseCase } from '../../application/use-cases/cambiar-contrasena/cambiar-contrasena.use-case';
import { MeUseCase } from '../../application/use-cases/me/me.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { AuthUser } from '../strategies/jwt.strategy';
import { RefreshUser } from '../strategies/jwt-refresh.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly recuperarContrasenaUseCase: RecuperarContrasenaUseCase,
    private readonly restablecerContrasenaUseCase: RestablecerContrasenaUseCase,
    private readonly cambiarContrasenaUseCase: CambiarContrasenaUseCase,
    private readonly meUseCase: MeUseCase,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al funcionario y retorna access token + refresh token. Máximo 5 intentos por 15 minutos.',
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta bloqueada' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos. Intente en 15 minutos' })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: Request & { user: { id: string } },
  ): Promise<AuthResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.loginUseCase.execute({ userId: req.user.id, ipAddress, userAgent });
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Revoca el refresh token del usuario autenticado. El access token expira de forma natural.',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado o access token inválido' })
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.logoutUseCase.execute({
      refreshToken: dto.refreshToken,
      userId: req.user.id,
      ipAddress,
      userAgent,
    });
  }

  // ── Refresh ────────────────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Renovar tokens',
    description:
      'Emite un nuevo par de tokens. El refresh token anterior queda revocado (rotación obligatoria).',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados correctamente',
    type: RefreshResponseDto,
  })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Genera un token de recuperación y lo asocia al correo. La respuesta es idéntica si el correo existe o no para evitar enumeración de usuarios. La integración con el servicio de correo se activará en la fase correspondiente.',
  })
  @ApiResponse({ status: 200, description: 'Solicitud procesada correctamente' })
  @ApiResponse({ status: 400, description: 'Correo electrónico inválido' })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con token',
    description:
      'Valida el token de recuperación (expiración 1 h, uso único) y actualiza la contraseña. Revoca todos los refresh tokens activos del usuario.',
  })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o contraseña insegura' })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ya utilizado' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description:
      'Requiere autenticación. Valida la contraseña actual, aplica política RN-51 y verifica historial de las últimas 5 contraseñas. Revoca todos los refresh tokens activos.',
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o política de contraseñas no cumplida',
  })
  @ApiResponse({ status: 401, description: 'No autenticado o contraseña actual incorrecta' })
  async cambiarContrasena(
    @Body() dto: CambiarContrasenaDto,
    @Req() req: Request & { user: AuthUser },
  ): Promise<{ message: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.cambiarContrasenaUseCase.execute({
      userId: req.user.id,
      contrasenaActual: dto.contrasenaActual,
      nuevaContrasena: dto.nuevaContrasena,
      ipAddress,
      userAgent,
    });
  }

  // ── Perfil ─────────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Retorna los datos del usuario autenticado. Nunca expone contraseñas, hashes ni tokens.',
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido correctamente', type: MeResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado o token expirado' })
  async me(@Req() req: Request & { user: AuthUser }): Promise<MeResponseDto> {
    return this.meUseCase.execute(req.user.id);
  }
}
