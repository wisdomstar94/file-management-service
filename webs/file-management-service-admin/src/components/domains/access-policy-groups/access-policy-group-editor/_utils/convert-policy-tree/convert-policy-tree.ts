import type {
  AccessPolicyHeaderMatchType,
  AccessPolicyIpMode,
  AccessPolicyNode,
} from "@fms/common-utils/access-policies/access-policy-node";

export type HeaderRow = { key: string; name: string; matchType: AccessPolicyHeaderMatchType; value: string };

/**
 * 편집 화면의 블록. 시안의 「특정 헤더 제한」 블록은 여러 헤더 조건을 모두 통과해야 하므로
 * 헤더만 담긴 AND 그룹(또는 헤더 1개)을 `HEADERS` 블록 하나로 보여준다. 의미가 같으므로 저장하면 원래 구조로 돌아간다.
 */
export type EditorBlock =
  | { kind: "GROUP"; key: string; operator: "AND" | "OR"; children: EditorBlock[] }
  | { kind: "IP"; key: string; mode: AccessPolicyIpMode; cidrs: string[] }
  | { kind: "HEADERS"; key: string; rows: HeaderRow[] };

export type EditorGroup = Extract<EditorBlock, { kind: "GROUP" }>;

let sequence = 0;
export const createKey = () => `block-${++sequence}`;

const toHeaderRow = (node: Extract<AccessPolicyNode, { type: "HEADER" }>): HeaderRow => ({
  key: createKey(),
  name: node.name,
  matchType: node.matchType,
  value: node.value ?? "",
});

const isHeaderOnlyAndGroup = (node: AccessPolicyNode) =>
  node.type === "GROUP" && node.operator === "AND" && node.children.every((child) => child.type === "HEADER");

function toBlock(node: AccessPolicyNode): EditorBlock {
  if (node.type === "IP") {
    return { kind: "IP", key: createKey(), mode: node.mode, cidrs: [...node.cidrs] };
  }
  if (node.type === "HEADER") {
    return { kind: "HEADERS", key: createKey(), rows: [toHeaderRow(node)] };
  }
  if (isHeaderOnlyAndGroup(node)) {
    return { kind: "HEADERS", key: createKey(), rows: node.children.map((child) => toHeaderRow(child as never)) };
  }
  return { kind: "GROUP", key: createKey(), operator: node.operator, children: node.children.map(toBlock) };
}

export function fromPolicyTree(tree: AccessPolicyNode | null): EditorGroup {
  if (tree === null) {
    return { kind: "GROUP", key: createKey(), operator: "AND", children: [] };
  }
  if (tree.type === "GROUP" && !isHeaderOnlyAndGroup(tree)) {
    return { kind: "GROUP", key: createKey(), operator: tree.operator, children: tree.children.map(toBlock) };
  }
  return { kind: "GROUP", key: createKey(), operator: "AND", children: [toBlock(tree)] };
}

function toNode(block: EditorBlock): AccessPolicyNode {
  if (block.kind === "IP") {
    return { type: "IP", mode: block.mode, cidrs: block.cidrs.map((cidr) => cidr.trim()).filter(Boolean) };
  }
  if (block.kind === "HEADERS") {
    const headers = block.rows.map((row) => ({
      type: "HEADER" as const,
      name: row.name.trim(),
      matchType: row.matchType,
      ...(row.matchType === "EXISTS" ? {} : { value: row.value }),
    }));
    return headers.length === 1 ? headers[0] : { type: "GROUP", operator: "AND", children: headers };
  }
  return { type: "GROUP", operator: block.operator, children: block.children.map(toNode) };
}

/** 조건이 하나도 없으면 `null`(제한 없음) */
export function toPolicyTree(root: EditorGroup): AccessPolicyNode | null {
  return root.children.length === 0 ? null : toNode(root);
}
