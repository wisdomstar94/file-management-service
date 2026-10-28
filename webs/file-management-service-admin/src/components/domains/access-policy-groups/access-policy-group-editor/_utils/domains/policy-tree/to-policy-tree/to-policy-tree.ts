import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import type { EditorGroup } from "../../../../_types/editor-block";
import { toNode } from "./_utils/to-node";

/** 조건이 하나도 없으면 `null`(제한 없음) */
export function toPolicyTree(root: EditorGroup): AccessPolicyNode | null {
  return root.children.length === 0 ? null : toNode(root);
}
