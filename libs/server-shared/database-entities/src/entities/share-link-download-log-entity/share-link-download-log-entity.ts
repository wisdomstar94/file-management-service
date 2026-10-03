import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { DocumentVersionEntity } from "../document-version-entity/index.js";
import type { ShareLinkEntity } from "../share-link-entity/index.js";

@Entity("share_link_download_log")
export class ShareLinkDownloadLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ name: "share_link_id", type: "uuid" })
  shareLinkId: string;

  @ManyToOne("ShareLinkEntity", { onDelete: "CASCADE" })
  @JoinColumn({ name: "share_link_id" })
  shareLink?: ShareLinkEntity;

  @Column({ name: "document_version_id", type: "uuid", nullable: true })
  documentVersionId: string | null;

  @ManyToOne("DocumentVersionEntity", { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "document_version_id" })
  documentVersion?: DocumentVersionEntity | null;

  @Column({ type: "varchar", length: 64 })
  ip: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
