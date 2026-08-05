import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { NotFoundException } from '../../../../../common/exceptions';
import { MeResponseDto } from '../../dtos/me-response.dto';

@Injectable()
export class MeUseCase {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
  ) {}

  async execute(userId: string): Promise<MeResponseDto> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['rol', 'dependencia'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado', 'USUARIO_NOT_FOUND');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol.nombre,
      dependencia: usuario.dependencia?.id ?? null,
      activo: usuario.activo,
      ultimoLogin: usuario.ultimoLogin,
    };
  }
}
