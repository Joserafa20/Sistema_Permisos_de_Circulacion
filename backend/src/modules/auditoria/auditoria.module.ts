import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaRegistroEntity } from './infrastructure/persistence/auditoria-registro.entity';
import { AuditoriaService } from './application/auditoria.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaRegistroEntity])],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
