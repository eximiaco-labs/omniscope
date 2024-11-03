import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface ComparisonProps {
  title: string;
  actual: number;
  approved: number;
}

interface PerformanceCardProps {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onSelect: () => void;
  regularHours: {
    actual: number;
    approved: number;
  };
  preContractedHours: {
    actual: number;
    approved: number;
  };
}

function ActualVsApprovedComparison({ title, actual, approved }: ComparisonProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <div className="mt-1">
        <div>
          <span className="text-xl font-bold">{actual.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">/ {approved.toFixed(1)}</span>
        </div>
        <div className="text-xs font-medium">
          {((actual / approved) * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export function PerformanceCard({ 
  title, 
  subtitle,
  isSelected, 
  onSelect,
  regularHours,
  preContractedHours
}: PerformanceCardProps) {
  const cardClassName = `cursor-pointer transition-all duration-300 transform ${
    isSelected 
      ? 'ring-2 ring-black shadow-lg scale-105'
      : 'hover:scale-102'
  }`;

  return (
    <Card 
      className={cardClassName}
      onClick={onSelect}
    >
      <CardHeader>
        <CardDescription>
          {title}
          {subtitle && <div className="text-xs mt-1">{subtitle}</div>}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ActualVsApprovedComparison
            title="Regular"
            actual={regularHours.actual}
            approved={regularHours.approved}
          />

          <ActualVsApprovedComparison 
            title="Pre-contracted"
            actual={preContractedHours.actual}
            approved={preContractedHours.approved}
          />
        </div>
      </CardContent>
    </Card>
  );
} 