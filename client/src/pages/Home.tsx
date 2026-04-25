import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Users,
  FileText,
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  CreditCard,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  variant: "primary" | "success" | "warning" | "danger";
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant, onClick }: StatCardProps) {
  const gradients: Record<string, string> = {
    primary: "from-indigo-500 to-indigo-600",
    success: "from-emerald-500 to-emerald-600",
    warning: "from-amber-500 to-amber-600",
    danger: "from-rose-500 to-rose-600",
  };

  const bgLight: Record<string, string> = {
    primary: "bg-indigo-50 text-indigo-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-rose-50 text-rose-600",
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-2">
              {trend && trendValue && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    trend === "up" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trendValue}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${bgLight[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[variant]}`} />
    </Card>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}

function QuickAction({ icon: Icon, label, description, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-all text-left w-full group"
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: studentAnalytics } = trpc.analytics.students.useQuery();
  const { data: financialAnalytics } = trpc.analytics.financial.useQuery();
  const { data: admissionsAnalytics } = trpc.analytics.admissions.useQuery();
  const { data: applications } = trpc.admissions.listApplications.useQuery({});
  const { data: invoices } = trpc.fees.listInvoices.useQuery({});
  const { data: classes } = trpc.masterData.classes.useQuery();

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const pendingApps = applications?.filter((a: any) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") || [];
  const unpaidInvoices = invoices?.filter((i: any) => i.status !== "PAID") || [];
  const collectionRate = financialAnalytics?.collectionRate ?? 0;

  const studentsByClass =
    classes?.map((cls) => ({
      name: cls.name.replace("Class ", ""),
      count: studentAnalytics?.byClass[cls.id] || 0,
    })) || [];

  const admissionsPipeline = [
    { name: "Submitted", value: admissionsAnalytics?.byStatus?.SUBMITTED || 0, color: "#6366f1" },
    { name: "Reviewing", value: admissionsAnalytics?.byStatus?.UNDER_REVIEW || 0, color: "#f59e0b" },
    { name: "Approved", value: admissionsAnalytics?.byStatus?.APPROVED || 0, color: "#10b981" },
    { name: "Rejected", value: admissionsAnalytics?.byStatus?.REJECTED || 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your school today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 font-normal">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
          <span className="text-sm text-muted-foreground">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={studentAnalytics?.total || 0}
          subtitle="Active enrollments"
          icon={Users}
          trend="up"
          trendValue="+12%"
          variant="primary"
          onClick={() => setLocation("/students")}
        />
        <StatCard
          title="Applications"
          value={admissionsAnalytics?.total || 0}
          subtitle={`${pendingApps.length} pending review`}
          icon={FileText}
          trend="up"
          trendValue={`${admissionsAnalytics?.byStatus?.APPROVED || 0} approved`}
          variant="success"
          onClick={() => setLocation("/admissions/applications")}
        />
        <StatCard
          title="Fee Collection"
          value={`₹${((financialAnalytics?.totalCollected || 0) / 1000).toFixed(0)}K`}
          subtitle={`${collectionRate.toFixed(0)}% collection rate`}
          icon={DollarSign}
          trend={collectionRate >= 75 ? "up" : "down"}
          trendValue={`₹${((financialAnalytics?.totalBilled || 0) / 1000).toFixed(0)}K billed`}
          variant={collectionRate >= 75 ? "success" : "warning"}
          onClick={() => setLocation("/fees/invoices")}
        />
        <StatCard
          title="Pending Dues"
          value={`₹${((financialAnalytics?.totalPending || 0) / 1000).toFixed(0)}K`}
          subtitle={`${financialAnalytics?.unpaidCount || 0} unpaid invoices`}
          icon={Receipt}
          trend="down"
          trendValue={`${financialAnalytics?.partiallyPaidCount || 0} partial`}
          variant="danger"
          onClick={() => setLocation("/fees/invoices")}
        />
      </div>

      {/* Action Items + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Action Items - Needs Attention */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Needs Your Attention</CardTitle>
              <Badge variant="destructive" className="font-normal">
                {pendingApps.length + unpaidInvoices.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApps.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {pendingApps.length} admission application{pendingApps.length !== 1 ? "s" : ""} awaiting review
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Oldest: {pendingApps[0]?.firstName} {pendingApps[0]?.lastName}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setLocation("/admissions/applications")}>
                  Review
                </Button>
              </div>
            )}

            {unpaidInvoices.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <div className="h-9 w-9 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? "s" : ""} with outstanding dues
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total: ₹{(financialAnalytics?.totalPending || 0).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setLocation("/fees/invoices")}>
                  View
                </Button>
              </div>
            )}

            {pendingApps.length === 0 && unpaidInvoices.length === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  All caught up! No pending items.
                </p>
              </div>
            )}

            {/* Collection Rate */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fee Collection Progress</span>
                <span className="text-sm font-bold">{collectionRate.toFixed(0)}%</span>
              </div>
              <Progress value={collectionRate} className="h-2" />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">
                  ₹{(financialAnalytics?.totalCollected || 0).toLocaleString()} collected
                </span>
                <span className="text-xs text-muted-foreground">
                  ₹{(financialAnalytics?.totalBilled || 0).toLocaleString()} total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              icon={UserPlus}
              label="New Admission"
              description="Create application"
              onClick={() => setLocation("/admissions/applications")}
            />
            <QuickAction
              icon={CreditCard}
              label="Record Payment"
              description="Capture fee payment"
              onClick={() => setLocation("/fees/invoices")}
            />
            <QuickAction
              icon={CalendarCheck}
              label="Mark Attendance"
              description="Today's attendance"
              onClick={() => setLocation("/attendance")}
            />
            <QuickAction
              icon={GraduationCap}
              label="Enter Marks"
              description="Exam results entry"
              onClick={() => setLocation("/exams")}
            />
            <QuickAction
              icon={BarChart3}
              label="View Analytics"
              description="Performance reports"
              onClick={() => setLocation("/performance")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Students by Class */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Enrollment by Class</CardTitle>
                <CardDescription>Student distribution across classes</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/students")}
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={studentsByClass} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Admissions Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Admissions Pipeline</CardTitle>
                <CardDescription>Application status breakdown</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/admissions/applications")}
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-[180px] h-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={admissionsPipeline}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {admissionsPipeline.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {admissionsPipeline.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
                {admissionsPipeline.length === 0 && (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/admissions/applications")}
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{app.applicationNo}</p>
                    </div>
                    <Badge
                      variant={
                        app.status === "APPROVED"
                          ? "default"
                          : app.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] shrink-0"
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No applications yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => setLocation("/admissions/applications")}
                >
                  Create first application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Financial Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setLocation("/fees/invoices")}
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Billed</p>
                  <p className="text-lg font-bold">
                    ₹{((financialAnalytics?.totalBilled || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="text-lg font-bold text-emerald-600">
                    ₹{((financialAnalytics?.totalCollected || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-rose-600">
                    ₹{((financialAnalytics?.totalPending || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
                  <p className="text-lg font-bold">{financialAnalytics?.paidCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Paid</p>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <Clock className="h-4 w-4 text-amber-600 mb-1" />
                  <p className="text-lg font-bold">{financialAnalytics?.partiallyPaidCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Partial</p>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                  <AlertTriangle className="h-4 w-4 text-rose-600 mb-1" />
                  <p className="text-lg font-bold">{financialAnalytics?.unpaidCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Unpaid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
