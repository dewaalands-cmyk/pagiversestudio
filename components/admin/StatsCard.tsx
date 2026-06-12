import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "mint" | "blue" | "purple" | "orange";
}

const COLOR_MAP = {
  mint: "bg-mint/10 text-mint",
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
  orange: "bg-orange-500/10 text-orange-400",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "mint",
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-navy-soft rounded-xl p-5 border border-cloud-200 dark:border-white/10 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-muted dark:text-slate-label font-medium">{title}</p>
          <p className="text-2xl font-bold text-navy-deep dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-muted dark:text-slate-label mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${COLOR_MAP[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
