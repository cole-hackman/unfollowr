"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

type Props = Omit<HTMLMotionProps<"button">, "ref" | "children"> & {
  children?: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  iconLeft?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Button({ variant="primary", size="md", className, iconLeft, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={clsx(
        [
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition",
          "disabled:pointer-events-none disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]",
          "rounded-[var(--r-md)]",
        ],
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-3 text-sm md:text-base",
        variant === "primary" && [
          "bg-[color:var(--primary)] text-white",
          "hover:bg-[color:var(--primary-hover)]",
          "shadow-md hover:shadow-lg",
        ],
        variant === "outline" && [
          "border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--text)]",
          "hover:bg-[color:var(--bg-accent)] hover:border-[color:var(--primary)]",
        ],
        variant === "ghost" && [
          "bg-transparent text-[color:var(--text)]",
          "hover:bg-[color:var(--bg-accent)]",
        ],
        className
      )}
      {...rest}
    >
      {iconLeft}{children}
    </motion.button>
  );
}
