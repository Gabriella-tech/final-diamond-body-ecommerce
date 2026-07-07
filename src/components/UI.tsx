import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { IconStar } from "./Icons";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "white" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const variants = {
    primary:
      "bg-[#4A0E16] text-white hover:bg-[#6b1722] active:bg-[#34090f] shadow-sm hover:shadow-md",
    outline:
      "border border-[#4A0E16] text-[#4A0E16] hover:bg-[#4A0E16] hover:text-white",
    ghost: "text-[#4A0E16] hover:bg-[#4A0E16]/5",
    white: "bg-white text-[#4A0E16] hover:bg-[#F5F5F5] shadow-md",
    dark: "bg-[#222222] text-white hover:bg-black",
  };
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "error" | "info" | "oxblood";
  className?: string;
}) {
  const tones = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    oxblood: "bg-[#4A0E16] text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StarRating({ value, size = 14, showNumber = false }: { value: number; size?: number; showNumber?: boolean }) {
  const full = Math.floor(value);
  return (
    <div className="inline-flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} size={size} filled={i < full} className={i < full ? "text-amber-500" : "text-gray-300"} />
      ))}
      {showNumber && <span className="ml-1 text-xs text-gray-600 font-medium">{value.toFixed(1)}</span>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && (
        <div className="text-xs font-bold tracking-[0.25em] text-[#4A0E16] uppercase mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222222] leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)}>
      {children}
    </div>
  );
}
