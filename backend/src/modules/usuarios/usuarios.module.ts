import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { TokenEntity } from '../auth/infrastructure/persistence/token.entity';
import { RoleEntity } from '../roles/infrastructure/persistence/role.entity';
import { DependenciaEntity } from '../dependencias/infrastructure/persistence/dependencia.entity';
import { UsuarioEntity } from './infrastructure/persistence/usuario.entity';
import { TypeOrmUsuarioRepository } from './infrastructure/persistence/typeorm-usuario.repository';
import { USUARIO_REPOSITORY_TOKEN } from './domain/ports/usuario-repository.interface';
import { ActivarUsuarioUseCase } from './application/use-cases/activar-usuario/activar-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/actualizar-usuario/actualizar-usuario.use-case';
import { CrearUsuarioUseCase } from './application/use-cases/crear-usuario/crear-usuario.use-case';
import { EliminarUsuarioUseCase } from './application/use-cases/eliminar-usuario/eliminar-usuario.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios/listar-usuarios.use-case';
import { ObtenerUsuarioPorIdUseCase } from './application/use-cases/obtener-usuario-por-id/obtener-usuario-por-id.use-case';
import { RestaurarUsuarioUseCase } from './application/use-cases/restaurar-usuario/restaurar-usuario.use-case';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity, RoleEntity, DependenciaEntity, TokenEntity]),
    AuditoriaModule,
  ],
  controllers: [UsuariosController],
  providers: [
    ListarUsuariosUseCase,
    ObtenerUsuarioPorIdUseCase,
    CrearUsuarioUseCase,
    ActualizarUsuarioUseCase,
    ActivarUsuarioUseCase,
    EliminarUsuarioUseCase,
    RestaurarUsuarioUseCase,
    {
      provide: USUARIO_REPOSITORY_TOKEN,
      useClass: TypeOrmUsuarioRepository,
    },
  ],
})
export class UsuariosModule {}
