import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  FUNCIONARIO = 'funcionario',
  ADMINISTRADOR = 'administrador',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
