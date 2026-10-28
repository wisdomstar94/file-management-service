import type { ReactNode } from "react";

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-white ${props.className ?? ""}`}>
      {props.children}
    </div>
  );
}

export function CardHeader(props: { icon?: string; title: string; description?: string; actions?: ReactNode }) {
  const { icon, title, description, actions } = props;
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-5.5 py-4">
      {icon && (
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <i className={`ti ${icon} text-[17px]`} aria-hidden />
        </div>
      )}
      <div className="flex-1">
        <div className="text-[15px] font-bold">{title}</div>
        {description && <div className="text-[12.5px] text-faint">{description}</div>}
      </div>
      {actions}
    </div>
  );
}
