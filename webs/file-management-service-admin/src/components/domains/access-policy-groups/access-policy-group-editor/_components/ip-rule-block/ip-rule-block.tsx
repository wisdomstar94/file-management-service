"use client";

import type { AccessPolicyIpMode } from "@fms/common-utils/access-policies/access-policy-node";
import { ChoiceCard } from "@/components/commons/choice-card";
import type { EditorBlock } from "../../_utils/convert-policy-tree";

type IpBlock = Extract<EditorBlock, { kind: "IP" }>;

const MODES: { mode: AccessPolicyIpMode; title: string; description: string }[] = [
  {
    mode: "ALLOW_ALL_EXCEPT",
    title: "기본 허용 · 지정 IP 차단",
    description: "모든 IP를 허용하고, 아래 목록만 차단합니다.",
  },
  {
    mode: "DENY_ALL_EXCEPT",
    title: "기본 차단 · 지정 IP 허용",
    description: "모든 IP를 차단하고, 아래 목록만 허용합니다.",
  },
];

const inputClassName =
  "h-9 min-w-0 rounded-lg border border-line-input px-2.5 font-mono text-[13px] outline-none focus:border-primary disabled:bg-disabled-bg";

export function IpRuleBlock(props: { block: IpBlock; isDisabled: boolean; onChange: (block: IpBlock) => void }) {
  const { block, isDisabled, onChange } = props;
  const setCidr = (index: number, value: string) =>
    onChange({ ...block, cidrs: block.cidrs.map((cidr, i) => (i === index ? value : cidr)) });

  return (
    <div className="flex flex-col gap-4 px-5.5 py-4.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
        {MODES.map((item) => (
          <ChoiceCard
            key={item.mode}
            withRadio
            isSelected={block.mode === item.mode}
            onSelect={() => !isDisabled && onChange({ ...block, mode: item.mode })}
          >
            <span className="block text-[13.5px] font-semibold">{item.title}</span>
            <span className="mt-0.75 block text-[12.5px] text-muted">{item.description}</span>
          </ChoiceCard>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-semibold">
          {block.mode === "DENY_ALL_EXCEPT" ? "허용할 IP" : "차단할 IP"}{" "}
          <span className="font-medium text-faint">{block.cidrs.length}</span>
        </div>
        {block.cidrs.map((cidr, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 입력 순서가 곧 식별자인 단순 문자열 목록
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2">
            <input
              aria-label={`IP ${index + 1}`}
              value={cidr}
              disabled={isDisabled}
              onChange={(event) => setCidr(index, event.target.value)}
              placeholder="IP 또는 CIDR (예: 10.0.0.0/8)"
              className={inputClassName}
            />
            <button
              type="button"
              aria-label="IP 삭제"
              disabled={isDisabled}
              onClick={() => onChange({ ...block, cidrs: block.cidrs.filter((_, i) => i !== index) })}
              className="cursor-pointer text-faint"
            >
              <i className="ti ti-trash text-[17px]" aria-hidden />
            </button>
          </div>
        ))}
        {!isDisabled && (
          <button
            type="button"
            onClick={() => onChange({ ...block, cidrs: [...block.cidrs, ""] })}
            className="mt-1 inline-flex cursor-pointer items-center gap-1.25 self-start text-[13px] font-semibold text-primary"
          >
            <i className="ti ti-plus text-[15px]" aria-hidden />
            IP 추가
          </button>
        )}
      </div>
    </div>
  );
}
