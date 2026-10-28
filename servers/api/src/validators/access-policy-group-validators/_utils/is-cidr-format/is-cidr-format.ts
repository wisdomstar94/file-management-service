import { readIpVersion } from "@fms/common-utils/networks/read-ip-version";

export function isCidrFormat(value: string): boolean {
  const [ip, prefix] = value.trim().split("/");
  const version = readIpVersion(ip);
  if (version === 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  const prefixNumber = Number(prefix);
  return Number.isInteger(prefixNumber) && prefixNumber >= 0 && prefixNumber <= (version === 4 ? 32 : 128);
}
