import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  className?: string;
  delay?: number;
}

const KPICard = ({ title, value, icon, subtitle, className, delay = 0 }: KPICardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-card p-5 animate-fade-in border border-border',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold mt-1.5 font-semibold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
