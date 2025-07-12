import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="p-12 text-center">
        {icon && (
          <div className="flex justify-center mb-6">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-primary mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;