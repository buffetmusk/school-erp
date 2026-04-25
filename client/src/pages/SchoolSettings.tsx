import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  School,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Users,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolSettings() {
  const [schoolName, setSchoolName] = useState("Delhi Public School");
  const [schoolEmail, setSchoolEmail] = useState("admin@dps.edu.in");
  const [schoolPhone, setSchoolPhone] = useState("+91 11 2649 8888");
  const [schoolAddress, setSchoolAddress] = useState("Mathura Road, New Delhi 110003");
  const [academicStart, setAcademicStart] = useState("April");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your school profile, preferences, and system configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="gap-2">
            <School className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* School Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                School Profile
              </CardTitle>
              <CardDescription>Basic information about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year Starts</Label>
                  <Input value={academicStart} onChange={(e) => setAcademicStart(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Settings saved")}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Branding
              </CardTitle>
              <CardDescription>Customize the look and feel of your portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg gradient-primary border" />
                    <Input defaultValue="#4338ca" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>School Logo</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Upload Logo</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <Badge variant="secondary">Trial</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Database</p>
                  <p className="font-medium">MySQL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure when and how notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Admission status changes", description: "Notify parents when application status changes" },
                { label: "Fee payment confirmations", description: "Send receipt via SMS after payment" },
                { label: "Attendance alerts", description: "Notify parents when student is marked absent" },
                { label: "Exam result notifications", description: "Alert parents when results are published" },
                { label: "Fee due reminders", description: "Auto-send reminders before due date" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Role-Based Access
              </CardTitle>
              <CardDescription>Manage permissions for each user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Admin", "Principal", "Teacher", "Accountant", "Parent"].map((role) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{role}</p>
                        <p className="text-xs text-muted-foreground">
                          {role === "Admin" ? "Full access" : "Restricted access"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your plan and payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="gradient-primary text-white mb-2">Current Plan</Badge>
                    <p className="text-lg font-bold">Trial</p>
                    <p className="text-sm text-muted-foreground">500 students, 50 staff</p>
                  </div>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Need a custom plan for your institution?</p>
                <p>Contact sales at sales@schoolerp.com</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
