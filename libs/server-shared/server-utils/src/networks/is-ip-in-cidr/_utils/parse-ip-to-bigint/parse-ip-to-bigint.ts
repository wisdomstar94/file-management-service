import { isIP } from "node:net";

export type ParsedIp = { version: 4 | 6; value: bigint };

function parseIpv4(ip: string): bigint {
  return ip.split(".").reduce((acc, octet) => (acc << 8n) + BigInt(Number(octet)), 0n);
}

function parseIpv6(ip: string): bigint {
  const [head, tail = ""] = ip.split("::");
  const toGroups = (part: string) => (part === "" ? [] : part.split(":"));
  const headGroups = toGroups(head);
  const tailGroups = toGroups(tail);

  const lastGroup = tailGroups.at(-1) ?? headGroups.at(-1);
  const embeddedIpv4Groups: string[] = [];
  if (lastGroup?.includes(".")) {
    const v4 = parseIpv4(lastGroup);
    embeddedIpv4Groups.push((v4 >> 16n).toString(16), (v4 & 0xffffn).toString(16));
    (tailGroups.length > 0 ? tailGroups : headGroups).pop();
  }

  const fixedTail = [...tailGroups, ...embeddedIpv4Groups];
  const zeroFillCount = ip.includes("::") ? 8 - headGroups.length - fixedTail.length : 0;
  const groups = [...headGroups, ...Array<string>(zeroFillCount).fill("0"), ...fixedTail];

  return groups.reduce((acc, group) => (acc << 16n) + BigInt(Number.parseInt(group, 16)), 0n);
}

/**
 * IP 문자열을 비교 가능한 정수로 바꿉니다. IPv4-mapped IPv6(`::ffff:1.2.3.4`)는 IPv4 로 취급합니다.
 * 올바른 IP 가 아니면 `null` 을 반환합니다.
 */
export function parseIpToBigint(ip: string): ParsedIp | null {
  const version = isIP(ip);
  if (version === 4) {
    return { version: 4, value: parseIpv4(ip) };
  }
  if (version !== 6) {
    return null;
  }

  const value = parseIpv6(ip);
  const isIpv4Mapped = value >> 32n === 0xffffn;
  if (isIpv4Mapped) {
    return { version: 4, value: value & 0xffffffffn };
  }
  return { version: 6, value };
}
