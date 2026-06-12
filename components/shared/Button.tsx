import { type LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
}

const VARIANTS = {
  primary: "bg-mint hover:bg-mint/90 text-navy-deep font-semibold",
  secondary: "border border-cloud-200 dark:border-white/10 text-navy-deep dark:text-white hover:bg-cloud-100 dark:hover:bg-white/5",
  ghost: "text-slate-muted hover:text-navy-deep dark:hover:text-white hover:bg-cloud-100 dark:hover:bg-white/5",
  danger: "bg-red-500 hover:bg-red-600 text-white font-semibold",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
}
