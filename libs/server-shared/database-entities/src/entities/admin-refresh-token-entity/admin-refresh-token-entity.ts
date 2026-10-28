import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { AdminAccountEntity } from "../admin-account-entity/index.js";

@Entity("admin_refresh_token")
export class AdminRefreshTokenEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ name: "admin_account_id", type: "uuid" })
  adminAccountId: string;

  @ManyToOne("AdminAccountEntity", { onDelete: "CASCADE" })
  @JoinColumn({ name: "admin_account_id" })
  adminAccount?: AdminAccountEntity;

  @Column({ name: "token_hash", type: "varchar", length: 128, unique: true })
  tokenHash: string;

  /** 로그인 한 번으로 시작된 토큰 계열. 갱신해도 그대로 이어받고, 재사용이 감지되면 계열째 폐기한다. */
  @Index()
  @Column({ name: "family_id", type: "uuid" })
  familyId: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  /** 갱신에 쓴 시각. 동시에 들어온 갱신 요청을 받아 주려고 바로 지우지 않고 유예 시간 동안 남겨 둔다. */
  @Column({ name: "used_at", type: "timestamptz", nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
