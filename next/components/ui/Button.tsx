"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

type Props = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: "primary" | "outline" | "ghost";
  iconLeft?: React.ReactNode;
};

export function Button({ variant="primary", className, iconLeft, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-[#2f6bff] text-white hover:bg-[#2157e6] shadow-lg",
        variant === "outline" && "border border-white/15 hover:border-white/30",
        variant === "ghost" && "hover:bg-white/5",
        className
      )}
      {...rest}
    >
      {iconLeft}{children}
    </motion.button>
  );
}
