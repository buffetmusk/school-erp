import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Save, X, Upload, FileText, Trash2, Plus, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function StudentDetails() {
  const [, params] = useRoute("/students/:id");
  const studentId = params?.id ? parseInt(params.id) : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<any>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showParentDialog, setShowParentDialog] = useState(false);

  const utils = trpc.useUtils();
  const { data: student, isLoading } = trpc.students.getById.useQuery({ id: studentId });
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: sections } = trpc.masterData.sections.useQuery(
    { classId: student?.classId || 0 },
    { enabled: !!student?.classId && student.classId > 0 }
  );
  const { data: academicYears } = trpc.masterData.academicYears.useQuery();
  const { data: documents } = trpc.students.getDocuments.useQuery({ studentId });
  const { data: invoices } = trpc.students.getInvoices.useQuery({ studentId });
  const { data: payments } = trpc.students.getPayments.useQuery({ studentId });
  const { data: parents } = trpc.students.getParents.useQuery({ studentId });
  const { data: studentMarks } = trpc.exams.getStudentMarks.useQuery({ studentId });
  const { data: documentTypes } = trpc.masterData.documentTypes.useQuery();
  const { data: feeStructures } = trpc.fees.listStructures.useQuery({});

  const updateStudent = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("Student profile updated successfully");
      utils.students.getById.invalidate({ id: studentId });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to update student: ${error.message}`);
    },
  });

  const addDocument = trpc.students.addDocument.useMutation({
    onSuccess: () => {
      toast.success("Document added successfully");
      utils.students.getDocuments.invalidate({ studentId });
      setShowDocumentDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to add document: ${error.message}`);
    },
  });

  const deleteDocument = trpc.students.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully");
      utils.students.getDocuments.invalidate({ studentId });
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const generateInvoice = trpc.students.generateInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice generated successfully");
      utils.students.getInvoices.invalidate({ studentId });
      setShowInvoiceDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate invoice: ${error.message}`);
    },
  });

  const addParent = trpc.students.addParent.useMutation({
    onSuccess: () => {
      toast.success("Parent added successfully");
      utils.students.getParents.invalidate({ studentId });
      setShowParentDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to add parent: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="container py-6">
        <p className="text-center text-muted-foreground">Loading student details...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container py-6">
        <p className="text-center text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const className = classes?.find((c) => c.id === student.classId)?.name;
  const sectionName = student.sectionId ? sections?.find((s) => s.id === student.sectionId)?.name : "-";
  const academicYearName = academicYears?.find((y) => y.id === student.academicYearId)?.name;

  const handleEdit = () => {
    setEditedStudent({ ...student });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateStudent.mutate({
      id: studentId,
      ...editedStudent,
    });
  };

  const handleCancel = () => {
    setEditedStudent(null);
    setIsEditing(false);
  };

  const handleDocumentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addDocument.mutate({
      studentId,
      documentTypeId: parseInt(formData.get("documentTypeId") as string),
      filePath: formData.get("filePath") as string,
    });
  };

  const handleInvoiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    generateInvoice.mutate({
      studentId,
      feeStructureId: parseInt(formData.get("feeStructureId") as string),
      dueDate: formData.get("dueDate") as string,
    });
  };

  const handleParentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addParent.mutate({
      studentId,
      relationship: formData.get("relationship") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string,
      occupation: formData.get("occupation") as string || undefined,
      isPrimary: formData.get("isPrimary") === "on" ? 1 : 0,
    });
  };

  const totalBilled = invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) || 0;
  const totalPaid = invoices?.reduce((sum, inv) => sum + inv.amountPaid, 0) || 0;
  const totalPending = totalBilled - totalPaid;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted-foreground">{student.studentNo}</p>
          </div>
          <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
            {student.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={updateStudent.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="fees">Fees & Invoices ({invoices?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments?.length || 0})</TabsTrigger>
          <TabsTrigger value="parents">Parents ({parents?.length || 0})</TabsTrigger>
          <TabsTrigger value="performance">Academic Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                {isEditing ? "Edit student profile information" : "View student profile information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.firstName || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, firstName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.lastName || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, lastName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedStudent?.dateOfBirth?.split("T")[0] || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, dateOfBirth: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  {isEditing ? (
                    <Select
                      value={editedStudent?.gender || ""}
                      onValueChange={(value) =>
                        setEditedStudent({ ...editedStudent, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{student.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.bloodGroup || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, bloodGroup: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.bloodGroup || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  {isEditing ? (
                    <Select
                      value={editedStudent?.classId?.toString() || ""}
                      onValueChange={(value) =>
                        setEditedStudent({ ...editedStudent, classId: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{className}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Section</Label>
                  {isEditing ? (
                    <Select
                      value={editedStudent?.sectionId?.toString() || ""}
                      onValueChange={(value) =>
                        setEditedStudent({ ...editedStudent, sectionId: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{sectionName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.rollNo || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, rollNo: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.rollNo || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <p className="text-sm">{academicYearName}</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedStudent?.status || ""}
                      onValueChange={(value) =>
                        setEditedStudent({ ...editedStudent, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="GRADUATED">Graduated</SelectItem>
                        <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{student.status}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.address || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, address: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.address || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.city || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, city: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.city || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.state || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, state: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.state || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Pincode</Label>
                  {isEditing ? (
                    <Input
                      value={editedStudent?.pincode || ""}
                      onChange={(e) =>
                        setEditedStudent({ ...editedStudent, pincode: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{student.pincode || "-"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Manage student documents and certificates</CardDescription>
                </div>
                <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>
                        Add a new document for this student
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDocumentSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentTypeId">Document Type</Label>
                        <Select name="documentTypeId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filePath">File Path/URL</Label>
                        <Input
                          id="filePath"
                          name="filePath"
                          placeholder="https://example.com/document.pdf"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={addDocument.isPending}>
                          Upload
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Uploaded Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.documentTypeName}
                        </TableCell>
                        <TableCell>
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.filePath, "_blank")}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDocument.mutate({ id: doc.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No documents uploaded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Billed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalBilled.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalPaid.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{totalPending.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fee Invoices</CardTitle>
                  <CardDescription>View and manage student fee invoices</CardDescription>
                </div>
                <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Invoice</DialogTitle>
                      <DialogDescription>
                        Create a new fee invoice for this student
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="feeStructureId">Fee Structure</Label>
                        <Select name="feeStructureId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee structure" />
                          </SelectTrigger>
                          <SelectContent>
                            {feeStructures?.map((fs) => (
                              <SelectItem key={fs.id} value={fs.id.toString()}>
                                {fs.name} - {fs.className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" name="dueDate" type="date" required />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={generateInvoice.isPending}>
                          Generate
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                        <TableCell>
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{invoice.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>₹{invoice.amountPaid.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "PAID"
                                ? "default"
                                : invoice.status === "PARTIALLY_PAID"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No invoices generated yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all payments made by this student</CardDescription>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Transaction Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          {payment.id}
                        </TableCell>
                        <TableCell>{payment.invoiceNo}</TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amountPaid.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.paymentMode}</TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.transactionRef || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No payments recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parents & Guardians</CardTitle>
                  <CardDescription>Manage parent and guardian information</CardDescription>
                </div>
                <Dialog open={showParentDialog} onOpenChange={setShowParentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Parent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Parent/Guardian</DialogTitle>
                      <DialogDescription>
                        Add parent or guardian information for this student
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleParentSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" name="firstName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" name="lastName" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select name="relationship" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input id="occupation" name="occupation" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isPrimary" name="isPrimary" />
                        <Label htmlFor="isPrimary">Primary Contact</Label>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={addParent.isPending}>
                          Add Parent
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {parents && parents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Primary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">
                          {parent.firstName} {parent.lastName}
                        </TableCell>
                        <TableCell>{parent.relationship}</TableCell>
                        <TableCell>{parent.phone}</TableCell>
                        <TableCell>{parent.email || "-"}</TableCell>
                        <TableCell>{parent.occupation || "-"}</TableCell>
                        <TableCell>
                          {parent.isPrimary === 1 ? (
                            <Badge>Primary</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No parent information added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>View exam results and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {studentMarks && studentMarks.length > 0 ? (
                <div className="space-y-6">
                  {/* Group marks by exam */}
                  {Object.entries(
                    studentMarks.reduce((acc: any, mark: any) => {
                      const examName = mark.examName || 'Unknown Exam';
                      if (!acc[examName]) {
                        acc[examName] = [];
                      }
                      acc[examName].push(mark);
                      return acc;
                    }, {})
                  ).map(([examName, marks]: [string, any]) => {
                    const totalMarks = marks.reduce((sum: number, m: any) => sum + (m.marksObtained || 0), 0);
                    const maxMarks = marks.reduce((sum: number, m: any) => sum + (m.maxMarks || 0), 0);
                    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : '0.00';

                    return (
                      <div key={examName} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">{examName}</h3>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total Marks</p>
                              <p className="text-lg font-bold">{totalMarks} / {maxMarks}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Percentage</p>
                              <p className="text-lg font-bold text-green-600">{percentage}%</p>
                            </div>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Marks Obtained</TableHead>
                              <TableHead>Max Marks</TableHead>
                              <TableHead>Percentage</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Remarks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marks.map((mark: any) => {
                              const subjectPercentage = mark.maxMarks > 0 ? ((mark.marksObtained / mark.maxMarks) * 100).toFixed(2) : '0.00';
                              const isPassed = mark.marksObtained >= (mark.passingMarks || 0);

                              return (
                                <TableRow key={mark.id}>
                                  <TableCell className="font-medium">{mark.subjectName}</TableCell>
                                  <TableCell>{mark.isAbsent ? 'Absent' : mark.marksObtained}</TableCell>
                                  <TableCell>{mark.maxMarks}</TableCell>
                                  <TableCell>{mark.isAbsent ? '-' : `${subjectPercentage}%`}</TableCell>
                                  <TableCell>
                                    {mark.isAbsent ? (
                                      <Badge variant="destructive">Absent</Badge>
                                    ) : isPassed ? (
                                      <Badge variant="default" className="bg-green-500">Pass</Badge>
                                    ) : (
                                      <Badge variant="destructive">Fail</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{mark.remarks || '-'}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No exam results available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
