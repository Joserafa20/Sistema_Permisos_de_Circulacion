import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { LoginDto } from '../../application/dtos/login.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { AuthResponseDto, RefreshResponseDto } from '../../application/dtos/auth-response.dto';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token/refresh-token.use-case';
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
  ) {}

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
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos. Intente en 15 minutos' })
  async login(
    @Body() _dto: LoginDto,
    @Req() req: Request & { user: { id: string } },
  ): Promise<AuthResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.loginUseCase.execute({ userId: req.user.id, ipAddress, userAgent });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Revoca el refresh token del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado o token inválido' })
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    summary: 'Renovar tokens',
    description:
      'Emite un nuevo par de tokens. El refresh token anterior queda revocado (rotación).',
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
}
