import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { DocumentVersionEntity } from "../document-version-entity/index.js";

@Entity("document")
export class DocumentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 300 })
  name: string;

  /** `null` 이면 최신 버전을 기본 버전으로 따른다. */
  @Column({ name: "default_version_id", type: "uuid", nullable: true })
  defaultVersionId: string | null;

  @ManyToOne("DocumentVersionEntity", { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "default_version_id" })
  defaultVersion?: DocumentVersionEntity | null;

  @OneToMany("DocumentVersionEntity", "document")
  versions?: DocumentVersionEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
