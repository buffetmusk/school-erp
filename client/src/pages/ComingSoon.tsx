import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Construction, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

export default function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full border-dashed">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Construction className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Coming Soon
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground max-w-sm">{description}</p>
          </div>
          {features && features.length > 0 && (
            <div className="w-full bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Planned Features
              </p>
              <ul className="space-y-2 text-sm text-left">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
