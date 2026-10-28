import { isIP } from "node:net";
import type { ParsedIp } from "./_types/parsed-ip/index.js";
import { parseIpv4 } from "./_utils/parse-ipv4/index.js";
import { parseIpv6 } from "./_utils/parse-ipv6/index.js";

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
