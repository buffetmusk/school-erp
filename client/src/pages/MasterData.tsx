import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("academic-years");
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Master Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage all master data for the school system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="fee-heads">Fee Heads</TabsTrigger>
          <TabsTrigger value="document-types">Documents</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="academic-years">
          <AcademicYearsTab />
        </TabsContent>

        <TabsContent value="classes">
          <ClassesTab />
        </TabsContent>

        <TabsContent value="sections">
          <SectionsTab />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectsTab />
        </TabsContent>

        <TabsContent value="fee-heads">
          <FeeHeadsTab />
        </TabsContent>

        <TabsContent value="document-types">
          <DocumentTypesTab />
        </TabsContent>

        <TabsContent value="staff">
          <StaffTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Academic Years Tab
function AcademicYearsTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "" });
  
  const { data: academicYears, refetch } = trpc.masterData.academicYears.useQuery();
  const createMutation = trpc.masterData.createAcademicYear.useMutation({
    onSuccess: () => {
      toast.success("Academic year created successfully");
      setOpen(false);
      setFormData({ name: "", startDate: "", endDate: "" });
      refetch();
    },
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>Manage academic year periods</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
                <DialogDescription>Add a new academic year period</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., 2026-2027"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicYears?.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium">{year.name}</TableCell>
                <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {year.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Classes Tab
function ClassesTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", displayOrder: 1 });
  
  const { data: classes, refetch } = trpc.masterData.classes.useQuery();
  const createMutation = trpc.masterData.createClass.useMutation({
    onSuccess: () => {
      toast.success("Class created successfully");
      setOpen(false);
      setFormData({ name: "", displayOrder: 1 });
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Manage class levels</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., Grade 10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Display Order</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes?.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>{cls.displayOrder}</TableCell>
                <TableCell>
                  {cls.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Sections Tab
function SectionsTab() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", classId: 0, capacity: 40 });
  
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: sections, refetch } = trpc.masterData.sections.useQuery(
    { classId: selectedClassId! },
    { enabled: !!selectedClassId }
  );
  
  const createMutation = trpc.masterData.createSection.useMutation({
    onSuccess: () => {
      toast.success("Section created successfully");
      setOpen(false);
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Manage class sections</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-2"
              value={selectedClassId || ""}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
            >
              <option value="">Select Class</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedClassId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Section</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Section Name</Label>
                    <Input
                      placeholder="e.g., A, B, C"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value, classId: selectedClassId! })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedClassId ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections?.map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium">{section.name}</TableCell>
                  <TableCell>{section.capacity}</TableCell>
                  <TableCell>
                    {section.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">Select a class to view sections</p>
        )}
      </CardContent>
    </Card>
  );
}

// Subjects Tab
function SubjectsTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  
  const { data: subjects, refetch } = trpc.masterData.subjects.useQuery();
  const createMutation = trpc.masterData.createSubject.useMutation({
    onSuccess: () => {
      toast.success("Subject created successfully");
      setOpen(false);
      setFormData({ name: "", code: "", description: "" });
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Manage subjects taught in the school</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subject</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Subject Code</Label>
                  <Input
                    placeholder="e.g., MATH"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects?.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell className="text-muted-foreground">{subject.description}</TableCell>
                <TableCell>
                  {subject.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Fee Heads Tab
function FeeHeadsTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  
  const { data: feeHeads, refetch } = trpc.masterData.feeHeads.useQuery();
  const createMutation = trpc.masterData.createFeeHead.useMutation({
    onSuccess: () => {
      toast.success("Fee head created successfully");
      setOpen(false);
      setFormData({ name: "", description: "" });
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Heads</CardTitle>
            <CardDescription>Manage fee categories</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Fee Head
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fee Head</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Fee Head Name</Label>
                  <Input
                    placeholder="e.g., Tuition Fee"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee Head</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeHeads?.map((feeHead) => (
              <TableRow key={feeHead.id}>
                <TableCell className="font-medium">{feeHead.name}</TableCell>
                <TableCell className="text-muted-foreground">{feeHead.description}</TableCell>
                <TableCell>
                  {feeHead.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Document Types Tab
function DocumentTypesTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", isRequired: 0 });
  
  const { data: documentTypes, refetch } = trpc.masterData.documentTypes.useQuery();
  const createMutation = trpc.masterData.createDocumentType.useMutation({
    onSuccess: () => {
      toast.success("Document type created successfully");
      setOpen(false);
      setFormData({ name: "", isRequired: 0 });
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Document Types</CardTitle>
            <CardDescription>Manage required document types for admissions</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Document Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Document Type</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Document Name</Label>
                  <Input
                    placeholder="e.g., Birth Certificate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired === 1}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked ? 1 : 0 })}
                  />
                  <Label htmlFor="isRequired">Required for admission</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentTypes?.map((docType) => (
              <TableRow key={docType.id}>
                <TableCell className="font-medium">{docType.name}</TableCell>
                <TableCell>
                  {docType.isRequired ? (
                    <Badge variant="destructive">Required</Badge>
                  ) : (
                    <Badge variant="outline">Optional</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {docType.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Staff Tab
function StaffTab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffNo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    dateOfJoining: "",
  });
  
  const { data: staff, refetch } = trpc.masterData.staff.useQuery();
  const createMutation = trpc.masterData.createStaff.useMutation({
    onSuccess: () => {
      toast.success("Staff member created successfully");
      setOpen(false);
      setFormData({
        staffNo: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        dateOfJoining: "",
      });
      refetch();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>Manage school staff and teachers</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Staff Number</Label>
                    <Input
                      placeholder="e.g., STAFF-004"
                      value={formData.staffNo}
                      onChange={(e) => setFormData({ ...formData, staffNo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Input
                      placeholder="e.g., Teacher, Principal"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Input
                      placeholder="e.g., Mathematics"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date of Joining</Label>
                    <Input
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate(formData)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff?.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.staffNo}</TableCell>
                <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.email}<br />{member.phone}
                </TableCell>
                <TableCell>
                  {member.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
