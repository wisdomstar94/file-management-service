export function parseIpv4(ip: string): bigint {
  return ip.split(".").reduce((acc, octet) => (acc << 8n) + BigInt(Number(octet)), 0n);
}
