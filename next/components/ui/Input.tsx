"use client";
import clsx from "clsx";
import type * as React from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  invalid?: boolean;
};

export function Input({ className, invalid, ...rest }: Props) {
  return (
    <input
      className={clsx(
        [
          "h-10 w-full px-3 text-sm",
          "rounded-[var(--r-md)]",
          "bg-[color:var(--surface)] text-[color:var(--text)]",
          "border border-[color:var(--border)]",
          "placeholder:text-[color:var(--text-faint)]",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)] focus-visible:border-[color:var(--primary)]",
          "disabled:pointer-events-none disabled:opacity-60",
        ],
        invalid && "border-[color:var(--danger)] focus-visible:ring-[color:var(--danger-soft)] focus-visible:border-[color:var(--danger)]",
        className
      )}
      aria-invalid={invalid || rest["aria-invalid"]}
      {...rest}
    />
  );
}

