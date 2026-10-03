import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function DataTable(props: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{props.children}</table>
    </div>
  );
}

export function HeadCell(props: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  const { align = "left", className = "", ...rest } = props;
  return (
    <th
      className={`whitespace-nowrap border-b border-line-table bg-surface-sub px-4 py-2.5 text-[12px] font-semibold text-muted ${align === "right" ? "text-right" : "text-left"} ${className}`}
      {...rest}
    />
  );
}

export function BodyCell(props: TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  const { align = "left", className = "", ...rest } = props;
  return (
    <td
      className={`border-b border-line-row px-4 py-3 text-[13px] ${align === "right" ? "text-right whitespace-nowrap" : ""} ${className}`}
      {...rest}
    />
  );
}

export function EmptyRow(props: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={props.colSpan} className="px-4 py-14 text-center text-[13.5px] text-faint">
        {props.message}
      </td>
    </tr>
  );
}
