"use client";

import type { AccessPolicyHeaderMatchType } from "@fms/common-utils/access-policies/access-policy-node";
import { createKey, type EditorBlock, type HeaderRow } from "../../_utils/convert-policy-tree";

type HeadersBlock = Extract<EditorBlock, { kind: "HEADERS" }>;

const MATCH_TYPES: { value: AccessPolicyHeaderMatchType; label: string }[] = [
  { value: "EQUALS", label: "일치" },
  { value: "CONTAINS", label: "포함" },
  { value: "REGEX", label: "정규식" },
  { value: "EXISTS", label: "존재" },
];

const GRID_CLASS_NAME = "grid grid-cols-[minmax(0,1.2fr)_120px_minmax(0,1.2fr)_32px] items-center gap-2";
const inputClassName =
  "h-9 min-w-0 rounded-lg border border-line-input px-2.5 font-mono text-[13px] outline-none focus:border-primary disabled:bg-disabled-bg";

export function HeaderRuleBlock(props: {
  block: HeadersBlock;
  isDisabled: boolean;
  onChange: (block: HeadersBlock) => void;
}) {
  const { block, isDisabled, onChange } = props;
  const setRow = (key: string, patch: Partial<HeaderRow>) =>
    onChange({ ...block, rows: block.rows.map((row) => (row.key === key ? { ...row, ...patch } : row)) });

  return (
    <div className="flex flex-col gap-2.5 px-5.5 py-4.5">
      <div className={`${GRID_CLASS_NAME} text-[12px] font-semibold text-faint`}>
        <span>헤더명</span>
        <span>조건</span>
        <span>값</span>
        <span />
      </div>
      {block.rows.map((row) => (
        <div key={row.key} className={GRID_CLASS_NAME}>
          <input
            aria-label="헤더명"
            value={row.name}
            disabled={isDisabled}
            onChange={(event) => setRow(row.key, { name: event.target.value })}
            placeholder="X-Internal-Token"
            className={inputClassName}
          />
          <select
            aria-label="조건"
            value={row.matchType}
            disabled={isDisabled}
            onChange={(event) => setRow(row.key, { matchType: event.target.value as AccessPolicyHeaderMatchType })}
            className="h-9 rounded-lg border border-line-input bg-white px-2 text-[13px] disabled:bg-disabled-bg"
          >
            {MATCH_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            aria-label="값"
            value={row.matchType === "EXISTS" ? "" : row.value}
            disabled={isDisabled || row.matchType === "EXISTS"}
            onChange={(event) => setRow(row.key, { value: event.target.value })}
            placeholder={row.matchType === "EXISTS" ? "값 없이 헤더 존재만 확인" : ""}
            className={inputClassName}
          />
          <button
            type="button"
            aria-label="헤더 조건 삭제"
            disabled={isDisabled || block.rows.length === 1}
            onClick={() => onChange({ ...block, rows: block.rows.filter((item) => item.key !== row.key) })}
            className="cursor-pointer text-faint disabled:cursor-not-allowed disabled:opacity-40"
          >
            <i className="ti ti-trash text-[17px]" aria-hidden />
          </button>
        </div>
      ))}
      {!isDisabled && (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...block,
              rows: [...block.rows, { key: createKey(), name: "", matchType: "EQUALS", value: "" }],
            })
          }
          className="mt-1 inline-flex cursor-pointer items-center gap-1.25 self-start text-[13px] font-semibold text-primary"
        >
          <i className="ti ti-plus text-[15px]" aria-hidden />
          헤더 조건 추가
        </button>
      )}
    </div>
  );
}
