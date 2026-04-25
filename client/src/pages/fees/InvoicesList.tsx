import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function InvoicesList() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "",
    transactionRef: "",
  });

  const { data: invoices, isLoading, refetch } = trpc.fees.listInvoices.useQuery({});
  const recordPayment = trpc.fees.recordPayment.useMutation();

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await recordPayment.mutateAsync({
        studentId: selectedInvoice.studentId || 1,
        invoiceId: selectedInvoice.id,
        amountPaid: parseFloat(paymentData.amountPaid),
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode as any,
        transactionRef: paymentData.transactionRef || undefined,
      });

      toast.success("Payment recorded successfully");
      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentData({
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "",
        transactionRef: "",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const openPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      ...paymentData,
      amountPaid: (invoice.totalAmount - invoice.amountPaid).toString(),
    });
    setPaymentDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "UNPAID":
        return `${baseClass} bg-red-100 text-red-800`;
      case "PARTIALLY_PAID":
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case "PAID":
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage student fee invoices and payments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {invoices
                ?.filter((inv: any) => inv.status !== "PAID")
                .reduce((sum: number, inv: any) => sum + (inv.totalAmount - inv.amountPaid), 0)
                .toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {invoices
                ?.reduce((sum: number, inv: any) => sum + inv.amountPaid, 0)
                .toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading invoices...</p>
          ) : invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                    <TableCell>{invoice.studentName}</TableCell>
                    <TableCell>₹{invoice.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{invoice.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>
                      ₹{(invoice.totalAmount - invoice.amountPaid).toLocaleString()}
                    </TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={getStatusBadgeClass(invoice.status)}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invoice.status !== "PAID" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDialog(invoice)}
                        >
                          Record Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No invoices found. Invoices will appear here once generated.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for invoice {selectedInvoice?.invoiceNo}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Outstanding Balance</Label>
                <p className="text-2xl font-bold">
                  ₹
                  {selectedInvoice
                    ? (selectedInvoice.totalAmount - selectedInvoice.amountPaid).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount to Pay *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={paymentData.amountPaid}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amountPaid: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode *</Label>
                <Select
                  value={paymentData.paymentMode}
                  onValueChange={(value) =>
                    setPaymentData({ ...paymentData, paymentMode: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="ONLINE">Online Payment</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionRef">Transaction Reference</Label>
                <Input
                  id="transactionRef"
                  value={paymentData.transactionRef}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, transactionRef: e.target.value })
                  }
                  placeholder="e.g., Cheque no, Transaction ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
