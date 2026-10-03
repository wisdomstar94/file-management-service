import { isIP } from "node:net";
import { parseIpToBigint } from "./_utils/parse-ip-to-bigint/index.js";

/**
 * `ip` 가 `cidr`(예: `10.0.0.0/8`, `2001:db8::/32`) 범위에 속하는지 판정합니다.
 * 접두 길이가 없으면 단일 IP 로 보고 일치 여부만 비교합니다. 형식이 잘못되면 `false` 입니다.
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const [rangeIp, prefixText] = cidr.trim().split("/");
  const target = parseIpToBigint(ip.trim());
  const range = parseIpToBigint(rangeIp);
  if (target === null || range === null) {
    return false;
  }
  if (target.version !== range.version) {
    return false;
  }

  const totalBits = range.version === 4 ? 32 : 128;
  // IPv4-mapped IPv6 범위(`::ffff:1.2.3.0/120`)는 IPv4 로 바뀌므로 접두 길이에서 앞 96비트를 뺀다.
  const mappedPrefixOffset = range.version === 4 && isIP(rangeIp) === 6 ? 96 : 0;
  const prefix = prefixText === undefined ? totalBits : Number(prefixText) - mappedPrefixOffset;
  const isValidPrefix = Number.isInteger(prefix) && prefix >= 0 && prefix <= totalBits;
  if (!isValidPrefix) {
    return false;
  }

  const shift = BigInt(totalBits - prefix);
  return target.value >> shift === range.value >> shift;
}
