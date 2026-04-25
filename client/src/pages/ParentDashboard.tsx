import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, User, GraduationCap, Calendar, Bell } from "lucide-react";

export default function ParentDashboard() {
  const [, setLocation] = useLocation();
  const { data: children, isLoading } = trpc.parentPortal.getMyChildren.useQuery();
  const { data: notifications } = trpc.parentPortal.getNotifications.useQuery({ isRead: false, limit: 5 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Children Found</CardTitle>
            <CardDescription>
              No student records are linked to your account. Please contact the school administration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-muted-foreground mt-1">View your children's academic progress and updates.</p>
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Children Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{child.firstName} {child.lastName}</CardTitle>
                    <CardDescription>Roll No: {child.studentNo}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{child.className || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Class</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation(`/parent/child/${child.id}/performance`)}
                >
                  Performance
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation(`/parent/child/${child.id}/attendance`)}
                >
                  Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
