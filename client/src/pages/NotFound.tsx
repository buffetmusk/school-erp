import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-dashed">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-6xl font-bold text-primary/20">404</div>
            <h2 className="text-xl font-semibold">Page Not Found</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setLocation("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
