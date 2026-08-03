import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { UsuarioEntity } from './infrastructure/persistence/usuario.entity';
import { TypeOrmUsuarioRepository } from './infrastructure/persistence/typeorm-usuario.repository';
import { USUARIO_REPOSITORY_TOKEN } from './domain/ports/usuario-repository.interface';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios/listar-usuarios.use-case';
import { ObtenerUsuarioPorIdUseCase } from './application/use-cases/obtener-usuario-por-id/obtener-usuario-por-id.use-case';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity]), AuditoriaModule],
  controllers: [UsuariosController],
  providers: [
    ListarUsuariosUseCase,
    ObtenerUsuarioPorIdUseCase,
    {
      provide: USUARIO_REPOSITORY_TOKEN,
      useClass: TypeOrmUsuarioRepository,
    },
  ],
})
export class UsuariosModule {}
