import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DollarSign, Calendar, FileText, ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function StaffProfile() {
  const params = useParams<{ id: string }>();
  const staffId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  // Dialogs state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    effectiveFrom: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "BANK_TRANSFER" as const,
    referenceNo: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    days: "",
    reason: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: staffList } = trpc.staff.listWithSalary.useQuery();
  const staff = staffList?.find((s) => s.id === staffId);

  const { data: currentSalary } = trpc.staff.getCurrentSalary.useQuery(
    { staffId },
    { enabled: !!staffId }
  );

  const { data: salaryHistory } = trpc.staff.getSalaryHistory.useQuery(
    { staffId },
    { enabled: !!staffId }
  );

  const { data: payments } = trpc.staff.getPayments.useQuery(
    { staffId },
    { enabled: !!staffId }
  );

  const { data: leaves } = trpc.staff.getLeaves.useQuery(
    { staffId },
    { enabled: !!staffId }
  );

  const { data: leaveTypes } = trpc.staff.getLeaveTypes.useQuery();

  // Mutations
  const createSalary = trpc.staff.createSalary.useMutation({
    onSuccess: () => {
      toast.success("Salary updated successfully");
      setSalaryDialogOpen(false);
      setSalaryForm({ basicSalary: "", allowances: "", deductions: "", effectiveFrom: "" });
      utils.staff.getCurrentSalary.invalidate({ staffId });
      utils.staff.getSalaryHistory.invalidate({ staffId });
      utils.staff.listWithSalary.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update salary: ${error.message}`);
    },
  });

  const recordPayment = trpc.staff.recordPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setPaymentDialogOpen(false);
      setPaymentForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "BANK_TRANSFER",
        referenceNo: "",
      });
      utils.staff.getPayments.invalidate({ staffId });
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  const applyLeave = trpc.staff.applyLeave.useMutation({
    onSuccess: () => {
      toast.success("Leave application submitted successfully");
      setLeaveDialogOpen(false);
      setLeaveForm({ leaveTypeId: "", startDate: "", endDate: "", days: "", reason: "" });
      utils.staff.getLeaves.invalidate({ staffId });
    },
    onError: (error) => {
      toast.error(`Failed to apply leave: ${error.message}`);
    },
  });

  const updateStaff = trpc.masterData.updateStaff.useMutation({
    onSuccess: () => {
      toast.success("Staff details updated successfully");
      setEditDialogOpen(false);
      utils.staff.listWithSalary.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update staff: ${error.message}`);
    },
  });

  const handleSalarySubmit = () => {
    if (!salaryForm.basicSalary || !salaryForm.effectiveFrom) {
      toast.error("Please fill all required fields");
      return;
    }

    createSalary.mutate({
      staffId,
      basicSalary: parseInt(salaryForm.basicSalary),
      allowances: salaryForm.allowances ? parseInt(salaryForm.allowances) : 0,
      deductions: salaryForm.deductions ? parseInt(salaryForm.deductions) : 0,
      effectiveFrom: salaryForm.effectiveFrom,
    });
  };

  const handlePaymentSubmit = () => {
    if (!paymentForm.amount) {
      toast.error("Please enter payment amount");
      return;
    }

    recordPayment.mutate({
      staffId,
      ...paymentForm,
      amount: parseInt(paymentForm.amount),
    });
  };

  const handleLeaveSubmit = () => {
    if (!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.days) {
      toast.error("Please fill all required fields");
      return;
    }

    applyLeave.mutate({
      staffId,
      leaveTypeId: parseInt(leaveForm.leaveTypeId),
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: parseFloat(leaveForm.days),
      reason: leaveForm.reason,
    });
  };

  const handleEditSubmit = () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.role) {
      toast.error("Please fill all required fields");
      return;
    }

    updateStaff.mutate({
      id: staffId,
      ...editForm,
    });
  };

  const openEditDialog = () => {
    if (staff) {
      setEditForm({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email || "",
        phone: staff.phone || "",
        department: staff.department || "",
        role: staff.role,
      });
      setEditDialogOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      PAID: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (!staff) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Staff member not found</div>
      </div>
    );
  }

  const totalSalary = currentSalary
    ? currentSalary.basicSalary + currentSalary.allowances - currentSalary.deductions
    : 0;

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        onClick={() => setLocation("/staff")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Staff List
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Details</CardTitle>
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">
                  {staff.firstName} {staff.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{staff.staffNo}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Role:</span> {staff.role}
                </p>
                <p>
                  <span className="font-medium">Department:</span> {staff.department || "-"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {staff.email || "-"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {staff.phone || "-"}
                </p>
                <p>
                  <span className="font-medium">Joining Date:</span>{" "}
                  {staff.dateOfJoining
                    ? new Date(staff.dateOfJoining).toLocaleDateString()
                    : "-"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge variant={staff.isActive ? "default" : "secondary"}>
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatCurrency(totalSalary)}</p>
              {currentSalary && (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    Basic: {formatCurrency(currentSalary.basicSalary)}
                  </p>
                  <p className="text-green-600">
                    Allowances: +{formatCurrency(currentSalary.allowances)}
                  </p>
                  <p className="text-red-600">
                    Deductions: -{formatCurrency(currentSalary.deductions)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Effective from{" "}
                    {new Date(currentSalary.effectiveFrom).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Summary</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {leaves?.filter((l) => l.status === "APPROVED").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Approved leaves this year</p>
              <div className="text-sm space-y-1 mt-4">
                <p>
                  Pending: {leaves?.filter((l) => l.status === "PENDING").length || 0}
                </p>
                <p>
                  Rejected: {leaves?.filter((l) => l.status === "REJECTED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="salary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="salary">Salary History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="leaves">Leave Records</TabsTrigger>
        </TabsList>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Salary History</CardTitle>
                  <CardDescription>All salary revisions for this staff member</CardDescription>
                </div>
                <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Update Salary
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Salary</DialogTitle>
                      <DialogDescription>
                        Create a new salary revision for {staff.firstName} {staff.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basicSalary">Basic Salary *</Label>
                        <Input
                          id="basicSalary"
                          type="number"
                          value={salaryForm.basicSalary}
                          onChange={(e) =>
                            setSalaryForm({ ...salaryForm, basicSalary: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="allowances">Allowances</Label>
                        <Input
                          id="allowances"
                          type="number"
                          value={salaryForm.allowances}
                          onChange={(e) =>
                            setSalaryForm({ ...salaryForm, allowances: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="deductions">Deductions</Label>
                        <Input
                          id="deductions"
                          type="number"
                          value={salaryForm.deductions}
                          onChange={(e) =>
                            setSalaryForm({ ...salaryForm, deductions: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="effectiveFrom">Effective From *</Label>
                        <Input
                          id="effectiveFrom"
                          type="date"
                          value={salaryForm.effectiveFrom}
                          onChange={(e) =>
                            setSalaryForm({ ...salaryForm, effectiveFrom: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSalarySubmit} disabled={createSalary.isPending}>
                        {createSalary.isPending ? "Updating..." : "Update Salary"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {salaryHistory && salaryHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryHistory.map((salary) => {
                      const total =
                        salary.basicSalary + salary.allowances - salary.deductions;
                      return (
                        <TableRow key={salary.id}>
                          <TableCell>
                            {new Date(salary.effectiveFrom).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{formatCurrency(salary.basicSalary)}</TableCell>
                          <TableCell className="text-green-600">
                            +{formatCurrency(salary.allowances)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            -{formatCurrency(salary.deductions)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No salary history found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All salary payments made to this staff member</CardDescription>
                </div>
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Salary Payment</DialogTitle>
                      <DialogDescription>
                        Record a new salary payment for {staff.firstName} {staff.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="month">Month *</Label>
                          <Select
                            value={paymentForm.month.toString()}
                            onValueChange={(value) =>
                              setPaymentForm({ ...paymentForm, month: parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                  {new Date(2000, month - 1).toLocaleString("default", {
                                    month: "long",
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="year">Year *</Label>
                          <Input
                            id="year"
                            type="number"
                            value={paymentForm.year}
                            onChange={(e) =>
                              setPaymentForm({ ...paymentForm, year: parseInt(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, amount: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMode">Payment Mode *</Label>
                        <Select
                          value={paymentForm.paymentMode}
                          onValueChange={(value: any) =>
                            setPaymentForm({ ...paymentForm, paymentMode: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="CHEQUE">Cheque</SelectItem>
                            <SelectItem value="ONLINE">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referenceNo">Reference Number</Label>
                        <Input
                          id="referenceNo"
                          value={paymentForm.referenceNo}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, referenceNo: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handlePaymentSubmit} disabled={recordPayment.isPending}>
                        {recordPayment.isPending ? "Recording..." : "Record Payment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.year, payment.month - 1).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.paymentMode}</TableCell>
                        <TableCell>{payment.referenceNo || "-"}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment records found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Leave Records</CardTitle>
                  <CardDescription>All leave applications for this staff member</CardDescription>
                </div>
                <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Apply Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply Leave</DialogTitle>
                      <DialogDescription>
                        Submit a new leave application for {staff.firstName} {staff.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="leaveType">Leave Type *</Label>
                        <Select
                          value={leaveForm.leaveTypeId}
                          onValueChange={(value) =>
                            setLeaveForm({ ...leaveForm, leaveTypeId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name} ({type.maxDaysPerYear} days/year)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={leaveForm.startDate}
                            onChange={(e) =>
                              setLeaveForm({ ...leaveForm, startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={leaveForm.endDate}
                            onChange={(e) =>
                              setLeaveForm({ ...leaveForm, endDate: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="days">Number of Days *</Label>
                        <Input
                          id="days"
                          type="number"
                          step="0.5"
                          value={leaveForm.days}
                          onChange={(e) =>
                            setLeaveForm({ ...leaveForm, days: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                          id="reason"
                          value={leaveForm.reason}
                          onChange={(e) =>
                            setLeaveForm({ ...leaveForm, reason: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLeaveSubmit} disabled={applyLeave.isPending}>
                        {applyLeave.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {leaves && leaves.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          {leave.leaveTypeName}
                          {leave.isPaid ? (
                            <Badge variant="outline" className="ml-2">
                              Paid
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {leave.reason || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell>
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leave records found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
            <DialogDescription>
              Update staff member information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateStaff.isPending}>
              {updateStaff.isPending ? "Updating..." : "Update Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
