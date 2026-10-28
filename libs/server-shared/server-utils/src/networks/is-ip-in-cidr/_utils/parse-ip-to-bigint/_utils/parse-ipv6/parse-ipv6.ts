import { parseIpv4 } from "../parse-ipv4/index.js";

export function parseIpv6(ip: string): bigint {
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
