import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("access_policy_group")
export class AccessPolicyGroupEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  /** `null` 이면 제한 없이 모든 접근을 허용한다. */
  @Column({ name: "rule_tree", type: "jsonb", nullable: true })
  ruleTree: AccessPolicyNode | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
