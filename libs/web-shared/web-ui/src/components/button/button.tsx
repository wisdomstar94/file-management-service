import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-white hover:bg-primary-hover",
  secondary: "border-line-input bg-white text-ink-2 hover:bg-surface-sub",
  danger: "border-danger-line bg-white text-danger hover:bg-danger-soft",
  ghost: "border-transparent bg-transparent text-sub hover:bg-chip",
};

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  md: "h-[38px] px-4 text-[13.5px] font-semibold rounded-lg gap-1.5",
  sm: "h-[30px] px-3 text-[12.5px] font-medium rounded-md gap-1",
};

const DISABLED_CLASS_NAMES =
  "disabled:border-line-table disabled:bg-disabled-bg disabled:text-disabled disabled:cursor-not-allowed";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    children?: ReactNode;
  },
) {
  const { variant = "secondary", size = "md", icon, className = "", children, type = "button", ...rest } = props;
  const iconClassName = rest.disabled && rest.title ? "ti ti-lock" : icon;

  return (
    <button
      type={type}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap border transition-colors ${VARIANT_CLASS_NAMES[variant]} ${SIZE_CLASS_NAMES[size]} ${DISABLED_CLASS_NAMES} ${className}`}
      {...rest}
    >
      {iconClassName && <i className={`${iconClassName} text-[16px]`} aria-hidden />}
      {children}
    </button>
  );
}
