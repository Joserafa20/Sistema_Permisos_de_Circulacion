import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './infrastructure/persistence/usuario.entity';
import { TypeOrmUsuarioRepository } from './infrastructure/persistence/typeorm-usuario.repository';
import { USUARIO_REPOSITORY_TOKEN } from './domain/ports/usuario-repository.interface';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios/listar-usuarios.use-case';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity])],
  controllers: [UsuariosController],
  providers: [
    ListarUsuariosUseCase,
    {
      provide: USUARIO_REPOSITORY_TOKEN,
      useClass: TypeOrmUsuarioRepository,
    },
  ],
})
export class UsuariosModule {}
