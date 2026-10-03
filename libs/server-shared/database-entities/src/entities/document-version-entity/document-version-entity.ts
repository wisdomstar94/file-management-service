import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { DocumentEntity } from "../document-entity/index.js";

@Entity("document_version")
@Index(["documentId", "seq"], { unique: true })
export class DocumentVersionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "document_id", type: "uuid" })
  documentId: string;

  @ManyToOne("DocumentEntity", "versions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "document_id" })
  document?: DocumentEntity;

  /** 같은 자료 안에서의 등록 순서. 값이 클수록 최신이다. */
  @Column({ type: "integer" })
  seq: number;

  @Column({ name: "version_name", type: "varchar", length: 100 })
  versionName: string;

  @Column({ name: "file_name", type: "varchar", length: 500 })
  fileName: string;

  @Column({ name: "file_size", type: "bigint", transformer: { to: (v: number) => v, from: (v: string) => Number(v) } })
  fileSize: number;

  @Column({ name: "mime_type", type: "varchar", length: 200 })
  mimeType: string;

  @Column({ name: "storage_key", type: "varchar", length: 500 })
  storageKey: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
