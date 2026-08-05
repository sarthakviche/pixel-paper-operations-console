import { DashboardSummary } from "@/types/domain.types";
import { Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

interface SummaryCardsProps {
  summary: DashboardSummary;
  activeFilter: string | null;
  onFilter: (key: string | null) => void;
}

export function SummaryCards({ summary, activeFilter, onFilter }: SummaryCardsProps) {
  const handleCardClick = (key: string) => {
    onFilter(activeFilter === key ? null : key);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Pending"
        count={summary.pending || 0}
        icon={Clock}
        isActive={activeFilter === 'pending'}
        onClick={() => handleCardClick('pending')}
      />
      <Card
        title="Awaiting Approval"
        count={summary.awaiting_approval || 0}
        icon={CheckCircle}
        isActive={activeFilter === 'awaiting_approval'}
        onClick={() => handleCardClick('awaiting_approval')}
        countClassName={(summary.awaiting_approval || 0) > 0 ? "text-yellow-400" : undefined}
      />
      <Card
        title="Overdue"
        count={summary.overdue || 0}
        icon={AlertTriangle}
        isActive={activeFilter === 'overdue'}
        onClick={() => handleCardClick('overdue')}
        countClassName={(summary.overdue || 0) > 0 ? "text-red-400" : undefined}
      />
      <Card
        title="In Progress"
        count={summary.in_progress || 0}
        icon={Zap}
        isActive={activeFilter === 'in_progress'}
        onClick={() => handleCardClick('in_progress')}
      />
    </div>
  );
}

interface CardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  countClassName?: string;
}

function Card({ title, count, icon: Icon, isActive, onClick, countClassName }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col text-left bg-[var(--bg-secondary)] p-6 rounded-[16px] border transition-all duration-300 w-full hover:bg-[var(--bg-elevated)] min-h-[44px]",
        isActive 
          ? "border-[#4ADE80] bg-[var(--bg-elevated)]" 
          : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
      )}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <Icon className="w-5 h-5 text-[#8C949C]" />
      </div>
      <div className={cn("text-[32px] font-semibold text-[#F5F7F8] leading-none mb-2", countClassName)}>
        {count}
      </div>
      <div className="text-sm text-[#8C949C] font-medium">
        {title}
      </div>
    </button>
  );
}
