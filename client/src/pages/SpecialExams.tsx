import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, IndianRupee, TrendingUp, Plus, Calendar, MapPin, Clock, Eye, UserPlus, Search, GraduationCap } from "lucide-react";

const CATEGORIES = ["OLYMPIAD", "ENTRANCE", "SCHOLARSHIP", "CERTIFICATION"] as const;
type Category = (typeof CATEGORIES)[number];
const STATUSES = ["OPEN", "CLOSED", "COMPLETED"] as const;

const CATEGORY_STYLES: Record<Category, string> = {
  OLYMPIAD: "bg-blue-100 text-blue-800 border-blue-200",
  ENTRANCE: "bg-purple-100 text-purple-800 border-purple-200",
  SCHOLARSHIP: "bg-amber-100 text-amber-800 border-amber-200",
  CERTIFICATION: "bg-green-100 text-green-800 border-green-200",
};
const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-slate-100 text-slate-800 border-slate-200",
};
const CATEGORY_LABELS: Record<Category, string> = {
  OLYMPIAD: "Olympiad", ENTRANCE: "Entrance", SCHOLARSHIP: "Scholarship", CERTIFICATION: "Certification",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface InstallmentRow { installmentNo: number; description: string; amount: string; dueDate: string }
interface CreateFormData {
  name: string; category: string; conductingBody: string; description: string;
  eligibleClassIds: number[]; examDate: string; registrationDeadline: string;
  venue: string; totalFee: string; numInstallments: number;
  installments: InstallmentRow[]; maxSeats: string; academicYearId: string;
}

const INITIAL_FORM: CreateFormData = {
  name: "", category: "", conductingBody: "", description: "",
  eligibleClassIds: [], examDate: "", registrationDeadline: "",
  venue: "", totalFee: "", numInstallments: 1,
  installments: [{ installmentNo: 1, description: "", amount: "", dueDate: "" }],
  maxSeats: "", academicYearId: "",
};

function buildInstallmentRows(count: number, existing: InstallmentRow[]): InstallmentRow[] {
  return Array.from({ length: count }, (_, i) =>
    existing[i] ?? { installmentNo: i + 1, description: "", amount: "", dueDate: "" }
  );
}

export default function SpecialExams() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateFormData>(INITIAL_FORM);

  const analyticsQuery = trpc.specialExams.analytics.useQuery();
  const { data: academicYears } = trpc.masterData.academicYears.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();
  const examsQuery = trpc.specialExams.list.useQuery({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const createMutation = trpc.specialExams.create.useMutation({
    onSuccess: () => {
      toast.success("Exam created successfully");
      setIsCreateOpen(false);
      setForm(INITIAL_FORM);
      examsQuery.refetch();
      analyticsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const filteredExams = useMemo(() => {
    if (!examsQuery.data) return [];
    if (!searchQuery.trim()) return examsQuery.data;
    const q = searchQuery.toLowerCase();
    return examsQuery.data.filter((e) => e.name.toLowerCase().includes(q));
  }, [examsQuery.data, searchQuery]);

  const analytics = analyticsQuery.data;
  const updateForm = (u: Partial<CreateFormData>) => setForm((p) => ({ ...p, ...u }));

  const handleInstallmentCountChange = (count: number) => {
    const c = Math.max(1, Math.min(4, count));
    setForm((p) => ({ ...p, numInstallments: c, installments: buildInstallmentRows(c, p.installments) }));
  };
  const updateInstallment = (idx: number, field: keyof InstallmentRow, value: string) => {
    setForm((p) => ({ ...p, installments: p.installments.map((r, i) => i === idx ? { ...r, [field]: value } : r) }));
  };
  const toggleClassId = (classId: number) => {
    setForm((p) => ({
      ...p,
      eligibleClassIds: p.eligibleClassIds.includes(classId)
        ? p.eligibleClassIds.filter((id) => id !== classId)
        : [...p.eligibleClassIds, classId],
    }));
  };

  const handleCreate = () => {
    const checks: [boolean, string][] = [
      [!form.name.trim(), "Please enter the exam name"],
      [!form.category, "Please select a category"],
      [!form.conductingBody.trim(), "Please enter the conducting body"],
      [form.eligibleClassIds.length === 0, "Please select at least one eligible class"],
      [!form.examDate, "Please enter the exam date"],
      [!form.registrationDeadline, "Please enter the registration deadline"],
      [!form.totalFee || parseFloat(form.totalFee) < 0, "Please enter a valid total fee"],
      [!form.academicYearId, "Please select an academic year"],
    ];
    for (const [fail, msg] of checks) { if (fail) { toast.error(msg); return; } }

    const totalFee = parseFloat(form.totalFee);
    const instSum = form.installments.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    if (Math.abs(instSum - totalFee) > 0.01) {
      toast.error(`Installment amounts (${formatCurrency(instSum)}) must equal total fee (${formatCurrency(totalFee)})`);
      return;
    }
    for (const row of form.installments) {
      if (!row.description.trim() || !row.amount || !row.dueDate) {
        toast.error("Please fill all installment fields (description, amount, due date)");
        return;
      }
    }

    createMutation.mutate({
      name: form.name.trim(), category: form.category as Category,
      conductingBody: form.conductingBody.trim(),
      description: form.description.trim() || undefined,
      eligibleClassIds: form.eligibleClassIds,
      examDate: form.examDate, registrationDeadline: form.registrationDeadline,
      venue: form.venue.trim() || undefined, totalFee,
      installments: form.installments.map((r, i) => ({
        installmentNo: i + 1, amount: parseFloat(r.amount), dueDate: r.dueDate, description: r.description.trim(),
      })),
      academicYearId: parseInt(form.academicYearId),
      maxSeats: form.maxSeats ? parseInt(form.maxSeats) : undefined,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Special & Competitive Exams</h1>
          <p className="text-muted-foreground mt-1">Manage Olympiads, entrance exams, scholarship tests, and certification programs</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Exam</Button>
          </DialogTrigger>
          <CreateExamDialog form={form} classes={classes} academicYears={academicYears}
            isPending={createMutation.isPending} onUpdateForm={updateForm}
            onInstallmentCountChange={handleInstallmentCountChange}
            onUpdateInstallment={updateInstallment} onToggleClassId={toggleClassId}
            onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
        </Dialog>
      </div>

      {/* Stats Cards */}
      {analyticsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="pt-6"><div className="flex items-start justify-between">
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-20" /></div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div></CardContent></Card>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Active Exams" value={String(analytics.activeExams)} subtitle={`${analytics.totalExams} total`}
            icon={<Trophy className="h-5 w-5 text-blue-600" />} iconBg="bg-blue-50" />
          <StatsCard title="Total Enrollments" value={String(analytics.totalEnrollments)}
            icon={<Users className="h-5 w-5 text-violet-600" />} iconBg="bg-violet-50" />
          <StatsCard title="Revenue Collected" value={formatCurrency(analytics.totalRevenue)}
            subtitle={`${formatCurrency(analytics.pendingFees)} pending`}
            icon={<IndianRupee className="h-5 w-5 text-emerald-600" />} iconBg="bg-emerald-50" />
          <StatsCard title="Collection Rate" value={`${Math.round(analytics.collectionRate)}%`}
            icon={<TrendingUp className="h-5 w-5 text-amber-600" />} iconBg="bg-amber-50" progress={analytics.collectionRate} />
        </div>
      ) : null}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-[180px]">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[2] min-w-[200px]">
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search exams by name..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Grid */}
      {examsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-5 space-y-4">
              <div className="flex justify-between"><Skeleton className="h-5 w-20 rounded-md" /><Skeleton className="h-5 w-14 rounded-md" /></div>
              <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((j) => <Skeleton key={j} className="h-12 w-full" />)}</div>
              <Skeleton className="h-2 w-full" />
              <div className="flex gap-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div>
            </CardContent></Card>
          ))}
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredExams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No exams found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery ? "Try adjusting your search or filters" : "Create your first special exam to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- Stats Card ---------- */
interface StatsCardProps {
  title: string; value: string; subtitle?: string;
  icon: React.ReactNode; iconBg: string; progress?: number;
}
function StatsCard({ title, value, subtitle, icon, iconBg, progress }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
        </div>
        {progress !== undefined && <Progress value={progress} className="mt-3 h-1.5" />}
      </CardContent>
    </Card>
  );
}

/* ---------- Exam Card ---------- */
interface ExamCardProps {
  exam: {
    id: number; name: string; category: string; conductingBody: string;
    description: string; examDate: string | Date; registrationDeadline: string | Date;
    venue: string; totalFee: number; status: string; maxSeats: number | null; enrolledCount: number;
  };
}
function ExamCard({ exam }: ExamCardProps) {
  const cat = exam.category as Category;
  const pct = exam.maxSeats && exam.maxSeats > 0 ? (exam.enrolledCount / exam.maxSeats) * 100 : 0;
  const badgeCls = (styles: Record<string, string>, key: string) =>
    `inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[key] ?? "bg-gray-100 text-gray-800 border-gray-200"}`;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={badgeCls(CATEGORY_STYLES, cat)}>{CATEGORY_LABELS[cat] ?? exam.category}</span>
          <span className={badgeCls(STATUS_STYLES, exam.status)}>{exam.status}</span>
        </div>
        <Link href={`/special-exams/${exam.id}`} className="text-lg font-semibold leading-tight hover:underline">
          {exam.name}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{exam.conductingBody}</p>
        {exam.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{exam.description}</p>}
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoCell icon={<Calendar className="h-4 w-4 shrink-0" />} label="Exam Date" value={formatDate(exam.examDate)} />
          <InfoCell icon={<Clock className="h-4 w-4 shrink-0" />} label="Reg. Deadline" value={formatDate(exam.registrationDeadline)} />
          <InfoCell icon={<MapPin className="h-4 w-4 shrink-0" />} label="Venue" value={exam.venue || "TBD"} truncate />
          <InfoCell icon={<IndianRupee className="h-4 w-4 shrink-0" />} label="Total Fee" value={formatCurrency(exam.totalFee)} />
        </div>
        {exam.maxSeats && exam.maxSeats > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Enrollment</span>
              <span className="font-medium">{exam.enrolledCount} / {exam.maxSeats} seats</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        )}
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/special-exams/${exam.id}`}><Eye className="mr-1.5 h-3.5 w-3.5" />View Details</Link>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/special-exams/${exam.id}`}><UserPlus className="mr-1.5 h-3.5 w-3.5" />Enroll Students</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCell({ icon, label, value, truncate }: { icon: React.ReactNode; label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground/70">{label}</p>
        <p className={`font-medium text-foreground ${truncate ? "truncate" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

/* ---------- Create Exam Dialog ---------- */
interface CreateExamDialogProps {
  form: CreateFormData;
  classes: Array<{ id: number; name: string }> | undefined;
  academicYears: Array<{ id: number; name: string }> | undefined;
  isPending: boolean;
  onUpdateForm: (u: Partial<CreateFormData>) => void;
  onInstallmentCountChange: (count: number) => void;
  onUpdateInstallment: (idx: number, field: keyof InstallmentRow, value: string) => void;
  onToggleClassId: (classId: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}
function CreateExamDialog({ form, classes, academicYears, isPending, onUpdateForm, onInstallmentCountChange, onUpdateInstallment, onToggleClassId, onSubmit, onCancel }: CreateExamDialogProps) {
  const instSum = form.installments.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalFee = parseFloat(form.totalFee) || 0;
  const matched = totalFee > 0 && Math.abs(instSum - totalFee) < 0.01;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Special Exam</DialogTitle>
        <DialogDescription>Add a new Olympiad, entrance exam, scholarship test, or certification program.</DialogDescription>
      </DialogHeader>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => onUpdateForm({ name: e.target.value })}
              placeholder="e.g., International Math Olympiad 2026" className="mt-1.5" />
          </div>
          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => onUpdateForm({ category: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Conducting Body *</Label>
            <Input value={form.conductingBody} onChange={(e) => onUpdateForm({ conductingBody: e.target.value })}
              placeholder="e.g., Science Olympiad Foundation" className="mt-1.5" />
          </div>
          <div>
            <Label>Academic Year *</Label>
            <Select value={form.academicYearId} onValueChange={(v) => onUpdateForm({ academicYearId: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select academic year" /></SelectTrigger>
              <SelectContent>
                {academicYears?.map((y) => <SelectItem key={y.id} value={y.id.toString()}>{y.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => onUpdateForm({ description: e.target.value })}
            placeholder="Brief description of the exam, eligibility criteria, benefits..." rows={3} className="mt-1.5" />
        </div>
        <div>
          <Label>Eligible Classes *</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {classes?.map((cls) => (
              <label key={cls.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.eligibleClassIds.includes(cls.id)} onCheckedChange={() => onToggleClassId(cls.id)} />
                {cls.name}
              </label>
            ))}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Exam Date *</Label>
            <Input type="date" value={form.examDate} onChange={(e) => onUpdateForm({ examDate: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Registration Deadline *</Label>
            <Input type="date" value={form.registrationDeadline} onChange={(e) => onUpdateForm({ registrationDeadline: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Venue</Label>
            <Input value={form.venue} onChange={(e) => onUpdateForm({ venue: e.target.value })}
              placeholder="e.g., School Campus" className="mt-1.5" />
          </div>
          <div>
            <Label>Max Seats</Label>
            <Input type="number" min={0} value={form.maxSeats} onChange={(e) => onUpdateForm({ maxSeats: e.target.value })}
              placeholder="Leave empty for unlimited" className="mt-1.5" />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Total Fee (INR) *</Label>
            <Input type="number" min={0} value={form.totalFee} onChange={(e) => onUpdateForm({ totalFee: e.target.value })}
              placeholder="e.g., 3500" className="mt-1.5" />
          </div>
          <div>
            <Label>Number of Installments (1-4)</Label>
            <Input type="number" min={1} max={4} value={form.numInstallments}
              onChange={(e) => onInstallmentCountChange(parseInt(e.target.value) || 1)} className="mt-1.5" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Installment Details</Label>
            {totalFee > 0 && (
              <span className={`text-xs font-medium ${matched ? "text-emerald-600" : "text-red-600"}`}>
                Sum: {formatCurrency(instSum)} / {formatCurrency(totalFee)} {matched ? "(matched)" : "(mismatch)"}
              </span>
            )}
          </div>
          {form.installments.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_140px] gap-2">
              <Input placeholder={`Installment ${i + 1} description`} value={row.description}
                onChange={(e) => onUpdateInstallment(i, "description", e.target.value)} />
              <Input type="number" min={0} placeholder="Amount" value={row.amount}
                onChange={(e) => onUpdateInstallment(i, "amount", e.target.value)} />
              <Input type="date" value={row.dueDate} onChange={(e) => onUpdateInstallment(i, "dueDate", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} disabled={isPending}>{isPending ? "Creating..." : "Create Exam"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
