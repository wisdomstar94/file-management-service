import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { AccessPolicyGroupEntity } from "../access-policy-group-entity/index.js";
import type { PermissionGroupEntity } from "../permission-group-entity/index.js";

@Entity("admin_account")
export class AdminAccountEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "login_id", type: "varchar", length: 100, unique: true })
  loginId: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ type: "varchar", length: 100 })
  nickname: string;

  @Column({ type: "text", default: "" })
  memo: string;

  @Column({ name: "permission_group_id", type: "uuid" })
  permissionGroupId: string;

  @ManyToOne("PermissionGroupEntity", { onDelete: "RESTRICT" })
  @JoinColumn({ name: "permission_group_id" })
  permissionGroup?: PermissionGroupEntity;

  @Column({ name: "access_policy_group_id", type: "uuid" })
  accessPolicyGroupId: string;

  @ManyToOne("AccessPolicyGroupEntity", { onDelete: "RESTRICT" })
  @JoinColumn({ name: "access_policy_group_id" })
  accessPolicyGroup?: AccessPolicyGroupEntity;

  @Column({ name: "last_accessed_at", type: "timestamptz", nullable: true })
  lastAccessedAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
