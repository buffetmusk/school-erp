import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Calendar, CreditCard, GraduationCap, MapPin, Search, Trophy, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const fmtDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const CATEGORY_COLORS: Record<string, string> = {
  OLYMPIAD: "bg-blue-100 text-blue-800 border-blue-200",
  ENTRANCE: "bg-purple-100 text-purple-800 border-purple-200",
  SCHOLARSHIP: "bg-amber-100 text-amber-800 border-amber-200",
  CERTIFICATION: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
};

const PAYMENT_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default", PARTIAL: "secondary", PENDING: "destructive",
};

const RESULT_BADGE: Record<string, { variant: "default" | "secondary" | "destructive"; cls?: string }> = {
  MERIT: { variant: "default", cls: "bg-green-100 text-green-800 border-green-200" },
  PASS: { variant: "secondary" },
  FAIL: { variant: "destructive" },
};

type PaymentMode = "CASH" | "BANK_TRANSFER" | "ONLINE" | "CHEQUE";

interface PaymentFormState {
  enrollmentId: number;
  installmentId: string;
  amount: string;
  paymentDate: string;
  paymentMode: PaymentMode | "";
  transactionRef: string;
}

const EMPTY_PAYMENT: PaymentFormState = {
  enrollmentId: 0, installmentId: "", amount: "",
  paymentDate: new Date().toISOString().split("T")[0], paymentMode: "", transactionRef: "",
};

function DetailRow({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}{label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function StatusSpan({ text, colorMap }: { text: string; colorMap: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[text] ?? ""}`}>
      {text}
    </span>
  );
}

export default function SpecialExamDetails() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);

  const [enrollOpen, setEnrollOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [payForm, setPayForm] = useState<PaymentFormState>(EMPTY_PAYMENT);
  const [filter, setFilter] = useState("");

  const utils = trpc.useUtils();
  const { data: exam, isLoading } = trpc.specialExams.getById.useQuery({ id: examId });
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: studentsList } = trpc.students.list.useQuery({}, { enabled: enrollOpen });

  const enrollMutation = trpc.specialExams.enroll.useMutation({
    onSuccess: () => {
      toast.success("Student enrolled successfully");
      utils.specialExams.getById.invalidate({ id: examId });
      setEnrollOpen(false);
      setEnrollStudentId("");
      setStudentSearch("");
    },
    onError: (err) => toast.error(err.message),
  });

  const payMutation = trpc.specialExams.recordPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      utils.specialExams.getById.invalidate({ id: examId });
      setPayOpen(false);
      setPayForm(EMPTY_PAYMENT);
    },
    onError: (err) => toast.error(err.message),
  });

  const classMap = useMemo(() => {
    const m = new Map<number, string>();
    if (classes) (classes as Array<{ id: number; name: string }>).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [classes]);

  const eligibleClassNames = useMemo(() => {
    if (!exam) return [];
    return exam.eligibleClassIds.map((id) => classMap.get(id)).filter(Boolean) as string[];
  }, [exam, classMap]);

  const eligibleStudents = useMemo(() => {
    if (!studentsList || !exam) return [];
    const eligible = (studentsList as Array<{ id: number; firstName: string; lastName: string; studentNo: string; classId: number }>)
      .filter((s) => exam.eligibleClassIds.includes(s.classId));
    if (!studentSearch) return eligible;
    const q = studentSearch.toLowerCase();
    return eligible.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.studentNo.toLowerCase().includes(q));
  }, [studentsList, exam, studentSearch]);

  const filtered = useMemo(() => {
    if (!exam) return [];
    if (!filter) return exam.enrollments;
    const q = filter.toLowerCase();
    return exam.enrollments.filter((e) => e.studentName.toLowerCase().includes(q) || e.studentNo.toLowerCase().includes(q));
  }, [exam, filter]);

  const results = useMemo(() => {
    if (!exam) return [];
    return [...exam.enrollments]
      .filter((e) => e.rank !== null || e.score !== null || e.result !== null)
      .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  }, [exam]);

  const totals = useMemo(() => {
    if (!exam) return { collected: 0, expected: 0 };
    return {
      collected: exam.enrollments.reduce((s, e) => s + e.amountPaid, 0),
      expected: exam.enrollments.reduce((s, e) => s + e.totalFee, 0),
    };
  }, [exam]);

  const rSummary = useMemo(() => ({
    appeared: results.length,
    merit: results.filter((r) => r.result === "MERIT").length,
    pass: results.filter((r) => r.result === "PASS").length,
    fail: results.filter((r) => r.result === "FAIL").length,
  }), [results]);

  const handleEnroll = () => {
    if (!enrollStudentId) { toast.error("Please select a student"); return; }
    enrollMutation.mutate({ specialExamId: examId, studentId: Number(enrollStudentId) });
  };

  const openPayDialog = (enrollmentId: number) => {
    setPayForm({ ...EMPTY_PAYMENT, enrollmentId });
    setPayOpen(true);
  };

  const handlePay = () => {
    if (!payForm.installmentId || !payForm.amount || !payForm.paymentMode) {
      toast.error("Please fill all required fields"); return;
    }
    payMutation.mutate({
      enrollmentId: payForm.enrollmentId,
      installmentId: Number(payForm.installmentId),
      amount: Number(payForm.amount),
      paymentDate: payForm.paymentDate,
      paymentMode: payForm.paymentMode as PaymentMode,
      transactionRef: payForm.transactionRef || undefined,
    });
  };

  const onInstChange = (id: string) => {
    const inst = exam?.installments.find((i) => i.id === Number(id));
    setPayForm({ ...payForm, installmentId: id, amount: inst ? String(inst.amount) : "" });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => <Skeleton key={n} className="h-64" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Exam not found</p>
        <Link href="/special-exams">
          <Button variant="ghost" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Special Exams</Button>
        </Link>
      </div>
    );
  }

  const seatsLeft = exam.maxSeats - exam.enrolledCount;
  const capPct = exam.maxSeats > 0 ? (exam.enrolledCount / exam.maxSeats) * 100 : 0;
  const payEnrollment = exam.enrollments.find((e) => e.id === payForm.enrollmentId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link href="/special-exams">
            <Button variant="ghost" size="sm" className="mb-1"><ArrowLeft className="mr-2 h-4 w-4" />Back to Special Exams</Button>
          </Link>
          <h1 className="text-3xl font-bold">{exam.name}</h1>
          <div className="flex items-center gap-2">
            <StatusSpan text={exam.category} colorMap={CATEGORY_COLORS} />
            <StatusSpan text={exam.status} colorMap={STATUS_COLORS} />
          </div>
        </div>
        {exam.status === "OPEN" && (
          <Button onClick={() => setEnrollOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Enroll Students</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Exam Details</CardTitle><CardDescription>General information</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow icon={Building2} label="Conducting Body" value={exam.conductingBody} />
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="text-sm mt-1">{exam.description}</p>
            </div>
            <Separator />
            <DetailRow icon={Calendar} label="Exam Date" value={fmtDate(exam.examDate)} />
            <DetailRow icon={Calendar} label="Registration Deadline" value={fmtDate(exam.registrationDeadline)} />
            <DetailRow icon={MapPin} label="Venue" value={exam.venue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Eligibility & Capacity</CardTitle><CardDescription>Who can participate</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2"><GraduationCap className="h-3.5 w-3.5" />Eligible Classes</span>
              <div className="flex flex-wrap gap-1.5">
                {eligibleClassNames.length > 0
                  ? eligibleClassNames.map((n) => <Badge key={n} variant="outline">{n}</Badge>)
                  : <span className="text-sm text-muted-foreground">Loading...</span>}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Capacity</span>
                <span className="font-medium">{exam.enrolledCount} / {exam.maxSeats}</span>
              </div>
              <Progress value={capPct} />
              <p className="text-xs text-muted-foreground">{seatsLeft > 0 ? `${seatsLeft} seats remaining` : "No seats remaining"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Fee Summary</CardTitle><CardDescription>Fee structure and collection</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow icon={CreditCard} label="Total Fee" value={fmt(exam.totalFee)} />
            <Separator />
            {exam.installments.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Installment Plan</span>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                      <TableHead className="text-xs text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.installments.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="text-xs">{i.installmentNo}</TableCell>
                        <TableCell className="text-xs">{i.description}</TableCell>
                        <TableCell className="text-xs text-right">{fmt(i.amount)}</TableCell>
                        <TableCell className="text-xs text-right">{fmtDate(i.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Separator />
            <DetailRow label="Total Collected" value={<span className="text-green-700">{fmt(totals.collected)}</span>} />
            <DetailRow label="Total Expected" value={fmt(totals.expected)} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled Students</TabsTrigger>
          <TabsTrigger value="installments">Fee Installments</TabsTrigger>
          {exam.status === "COMPLETED" && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Enrolled Students</CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or student no..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {exam.enrollments.length === 0 ? "No students enrolled yet" : "No students match your search"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student No</TableHead><TableHead>Student Name</TableHead><TableHead>Class</TableHead>
                        <TableHead>Enrollment Date</TableHead><TableHead>Roll No</TableHead><TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Amount Paid</TableHead><TableHead className="text-right">Fee Due</TableHead>
                        <TableHead>Status</TableHead><TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-mono text-sm">{e.studentNo}</TableCell>
                          <TableCell className="font-medium">{e.studentName}</TableCell>
                          <TableCell>{e.className}</TableCell>
                          <TableCell>{fmtDate(e.enrollmentDate)}</TableCell>
                          <TableCell>{e.examRollNo ?? "-"}</TableCell>
                          <TableCell><Badge variant={PAYMENT_VARIANT[e.paymentStatus]}>{e.paymentStatus}</Badge></TableCell>
                          <TableCell className="text-right">{fmt(e.amountPaid)}</TableCell>
                          <TableCell className="text-right">{fmt(e.totalFee - e.amountPaid)}</TableCell>
                          <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {e.paymentStatus !== "PAID" && (
                                <Button variant="outline" size="sm" onClick={() => openPayDialog(e.id)}>
                                  <CreditCard className="mr-1 h-3 w-3" />Pay
                                </Button>
                              )}
                              <Link href={`/students/${e.studentId}`}><Button variant="ghost" size="sm">View</Button></Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div><span className="text-muted-foreground">Total Students: </span><span className="font-semibold">{exam.enrollments.length}</span></div>
                    <div><span className="text-muted-foreground">Total Collected: </span><span className="font-semibold text-green-700">{fmt(totals.collected)}</span></div>
                    <div><span className="text-muted-foreground">Total Pending: </span><span className="font-semibold text-red-700">{fmt(totals.expected - totals.collected)}</span></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments">
          <Card>
            <CardHeader><CardTitle className="text-lg">Fee Installments</CardTitle><CardDescription>Installment-wise fee collection overview</CardDescription></CardHeader>
            <CardContent>
              {exam.installments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No installment plan configured for this exam</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installment</TableHead><TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Students Paid</TableHead><TableHead className="text-right">Collection Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.installments.map((inst) => {
                      const paid = exam.enrollments.filter((e) => e.amountPaid >= inst.amount * inst.installmentNo).length;
                      const total = exam.enrollments.length;
                      const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                      return (
                        <TableRow key={inst.id}>
                          <TableCell className="font-medium">Installment {inst.installmentNo}</TableCell>
                          <TableCell>{inst.description}</TableCell>
                          <TableCell className="text-right">{fmt(inst.amount)}</TableCell>
                          <TableCell>{fmtDate(inst.dueDate)}</TableCell>
                          <TableCell className="text-right">{paid} / {total}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={pct} className="w-20" />
                              <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {exam.status === "COMPLETED" && (
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><CardTitle className="text-lg">Results</CardTitle><CardDescription>Exam results sorted by rank</CardDescription></div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4 text-amber-500" /><span>Appeared: {rSummary.appeared}</span></div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Merit: {rSummary.merit}</Badge>
                    <Badge variant="secondary">Pass: {rSummary.pass}</Badge>
                    <Badge variant="destructive">Fail: {rSummary.fail}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No results available yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Rank</TableHead><TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead><TableHead className="text-right">Score</TableHead><TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r) => {
                        const rb = r.result ? RESULT_BADGE[r.result] : undefined;
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-semibold">{r.rank ?? "-"}</TableCell>
                            <TableCell className="font-medium">{r.studentName}</TableCell>
                            <TableCell>{r.className}</TableCell>
                            <TableCell className="text-right">{r.score ?? "-"}</TableCell>
                            <TableCell>
                              {rb ? <Badge variant={rb.variant} className={rb.cls}>{r.result}</Badge> : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>Select an eligible student to enroll in {exam.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Student</Label>
              <Input placeholder="Search by name or roll number..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={enrollStudentId} onValueChange={setEnrollStudentId}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>
                  {eligibleStudents.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName} ({s.studentNo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>{enrollMutation.isPending ? "Enrolling..." : "Enroll"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {payEnrollment ? `Payment for ${payEnrollment.studentName} (${payEnrollment.studentNo})` : "Record a fee payment"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {payEnrollment && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Fee</span><span className="font-medium">{fmt(payEnrollment.totalFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-medium text-green-700">{fmt(payEnrollment.amountPaid)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Balance Due</span><span className="font-medium text-red-700">{fmt(payEnrollment.totalFee - payEnrollment.amountPaid)}</span></div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Installment</Label>
              <Select value={payForm.installmentId} onValueChange={onInstChange}>
                <SelectTrigger><SelectValue placeholder="Select installment" /></SelectTrigger>
                <SelectContent>
                  {exam.installments.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>Installment {i.installmentNo} - {fmt(i.amount)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="Enter amount" />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={payForm.paymentMode} onValueChange={(v) => setPayForm({ ...payForm, paymentMode: v as PaymentMode })}>
                <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference (Optional)</Label>
              <Input value={payForm.transactionRef} onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })} placeholder="Transaction ID or reference" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={handlePay} disabled={payMutation.isPending}>{payMutation.isPending ? "Recording..." : "Record Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
