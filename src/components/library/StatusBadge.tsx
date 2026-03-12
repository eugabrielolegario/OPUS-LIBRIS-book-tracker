import { BookStatus, STATUS_CONFIG } from '@/types/book';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', config.class, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  );
};

export default StatusBadge;
