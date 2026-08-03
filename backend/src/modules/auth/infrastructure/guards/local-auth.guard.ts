import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../../../common/exceptions';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
    if (err) throw err;
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return user;
  }
}
