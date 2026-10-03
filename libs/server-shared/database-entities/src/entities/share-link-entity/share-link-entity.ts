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
import type { DocumentEntity } from "../document-entity/index.js";
import type { DocumentVersionEntity } from "../document-version-entity/index.js";

export type ShareLinkDefaultVersionMode = "FOLLOW_DOCUMENT" | "FIXED";

@Entity("share_link")
export class ShareLinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "document_id", type: "uuid" })
  documentId: string;

  @ManyToOne("DocumentEntity", { onDelete: "CASCADE" })
  @JoinColumn({ name: "document_id" })
  document?: DocumentEntity;

  @Column({ type: "varchar", length: 64, unique: true })
  token: string;

  @Column({ name: "access_policy_group_id", type: "uuid", nullable: true })
  accessPolicyGroupId: string | null;

  @ManyToOne("AccessPolicyGroupEntity", { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "access_policy_group_id" })
  accessPolicyGroup?: AccessPolicyGroupEntity | null;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true })
  passwordHash: string | null;

  /** `null` 이면 다운로드 횟수 제한이 없다. */
  @Column({ name: "max_download_count", type: "integer", nullable: true })
  maxDownloadCount: number | null;

  @Column({ name: "download_count", type: "integer", default: 0 })
  downloadCount: number;

  @Column({ name: "available_from", type: "timestamptz", nullable: true })
  availableFrom: Date | null;

  @Column({ name: "available_until", type: "timestamptz", nullable: true })
  availableUntil: Date | null;

  @Column({ name: "default_version_mode", type: "varchar", length: 20, default: "FOLLOW_DOCUMENT" })
  defaultVersionMode: ShareLinkDefaultVersionMode;

  @Column({ name: "fixed_version_id", type: "uuid", nullable: true })
  fixedVersionId: string | null;

  @ManyToOne("DocumentVersionEntity", { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "fixed_version_id" })
  fixedVersion?: DocumentVersionEntity | null;

  @Column({ name: "is_show_other_versions", type: "boolean", default: false })
  isShowOtherVersions: boolean;

  @Column({ name: "is_allow_other_version_download", type: "boolean", default: false })
  isAllowOtherVersionDownload: boolean;

  @Column({ name: "is_show_download_status", type: "boolean", default: false })
  isShowDownloadStatus: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
