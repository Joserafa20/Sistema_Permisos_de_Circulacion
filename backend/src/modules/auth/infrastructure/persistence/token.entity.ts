import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { TipoToken } from '../../../../common/enums';

@Entity({ name: 'tokens' })
@Index('idx_tokens_usuario_tipo_revocado', ['usuario', 'tipo', 'revocado'])
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_tokens_token_hash')
  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  tipo: TipoToken;

  @Column({ name: 'expira_at', type: 'timestamptz' })
  expiraAt: Date;

  @Column({ name: 'revocado', type: 'boolean', default: false })
  revocado: boolean;

  @Column({ name: 'revocado_at', type: 'timestamptz', nullable: true })
  revocadoAt: Date | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UsuarioEntity, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity>;
}
