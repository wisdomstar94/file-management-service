export function VersionBadge(props: { children: string; tone?: "primary" | "warn" | "neutral" }) {
  const { children, tone = "primary" } = props;
  const toneClassName = {
    primary: "bg-primary-soft text-primary",
    warn: "bg-warn-soft text-warn",
    neutral: "bg-chip text-sub",
  }[tone];
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2 py-[3px] font-mono text-[12.5px] font-medium ${toneClassName}`}
    >
      {children}
    </span>
  );
}
