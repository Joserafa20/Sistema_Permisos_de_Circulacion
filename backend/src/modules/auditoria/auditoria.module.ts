import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaRegistroEntity } from './infrastructure/persistence/auditoria-registro.entity';
import { AuditoriaService } from './application/auditoria.service';
import { AuditoriaController } from './infrastructure/controllers/auditoria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaRegistroEntity])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
