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

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
