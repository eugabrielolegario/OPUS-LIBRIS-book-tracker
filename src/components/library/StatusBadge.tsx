import { Badge } from '@/components/ui/badge';
import { BookStatus, STATUS_CONFIG } from '@/types/book';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn('font-medium text-xs gap-1.5', config.class, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </Badge>
  );
};

export default StatusBadge;
