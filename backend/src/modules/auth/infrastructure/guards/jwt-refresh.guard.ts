import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../../../common/exceptions';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err) throw err;
    if (!user) throw new UnauthorizedException('Token de actualización inválido o expirado');
    return user;
  }
}
