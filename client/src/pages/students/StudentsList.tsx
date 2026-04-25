import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, UserPlus, Eye } from "lucide-react";

export default function StudentsList() {
  const [filters, setFilters] = useState({
    classId: undefined as number | undefined,
    sectionId: undefined as number | undefined,
    academicYearId: undefined as number | undefined,
    status: undefined as string | undefined,
    search: "",
  });

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: students, refetch, isLoading } = trpc.students.list.useQuery(filters);
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: sections } = trpc.masterData.sections.useQuery(
    { classId: filters.classId! },
    { enabled: !!filters.classId }
  );
  const { data: academicYears } = trpc.masterData.academicYears.useQuery();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      classId: undefined,
      sectionId: undefined,
      academicYearId: undefined,
      status: undefined,
      search: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student records and enrollments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll from Application
              </Button>
            </DialogTrigger>
            <DialogContent>
              <EnrollFromApplicationDialog onClose={() => { setEnrollDialogOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateStudentDialog onClose={() => { setCreateDialogOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter students by class, section, academic year, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="grid gap-2">
              <Label>Academic Year</Label>
              <Select
                value={filters.academicYearId?.toString() || "all"}
                onValueChange={(value) => handleFilterChange("academicYearId", value === "all" ? undefined : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Class</Label>
              <Select
                value={filters.classId?.toString() || "all"}
                onValueChange={(value) => {
                  handleFilterChange("classId", value === "all" ? undefined : Number(value));
                  handleFilterChange("sectionId", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Section</Label>
              <Select
                value={filters.sectionId?.toString() || "all"}
                onValueChange={(value) => handleFilterChange("sectionId", value === "all" ? undefined : Number(value))}
                disabled={!filters.classId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or Student No"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            {students ? `${students.length} student${students.length !== 1 ? "s" : ""} found` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading students...</p>
          ) : students && students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentNo}</TableCell>
                    <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell>{classes?.find((c) => c.id === student.classId)?.name}</TableCell>
                    <TableCell>{student.sectionId ? sections?.find((s) => s.id === student.sectionId)?.name : "-"}</TableCell>
                    <TableCell>{student.rollNo || "-"}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${student.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No students found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enroll from Application Dialog
function EnrollFromApplicationDialog({ onClose }: { onClose: () => void }) {
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [rollNo, setRollNo] = useState("");

  const { data: applications } = trpc.admissions.listApplications.useQuery({ status: "APPROVED" });
  const { data: applicationDetails } = trpc.admissions.getApplicationById.useQuery(
    { id: selectedApplicationId },
    { enabled: !!selectedApplicationId }
  );
  const { data: sections } = trpc.masterData.sections.useQuery(
    { classId: applicationDetails?.classId! },
    { enabled: !!applicationDetails?.classId }
  );

  const enrollMutation = trpc.students.enrollFromApplication.useMutation({
    onSuccess: () => {
      toast.success("Student enrolled successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEnroll = () => {
    if (!selectedApplicationId) {
      toast.error("Please select an application");
      return;
    }
    enrollMutation.mutate({
      applicationId: selectedApplicationId,
      sectionId,
      rollNo: rollNo || undefined,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enroll Student from Application</DialogTitle>
        <DialogDescription>Select an approved application to enroll as a student</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Approved Application</Label>
          <Select value={selectedApplicationId} onValueChange={setSelectedApplicationId}>
            <SelectTrigger>
              <SelectValue placeholder="Select application" />
            </SelectTrigger>
            <SelectContent>
              {applications?.map((app: any) => (
                <SelectItem key={app.id} value={app.id}>
                  {app.firstName} {app.lastName} - {app.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedApplicationId && (
          <>
            <div className="grid gap-2">
              <Label>Section (Optional)</Label>
              <Select value={sectionId?.toString() || ""} onValueChange={(value) => setSectionId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Roll Number (Optional)</Label>
              <Input
                placeholder="e.g., 101"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
          {enrollMutation.isPending ? "Enrolling..." : "Enroll Student"}
        </Button>
      </DialogFooter>
    </>
  );
}

// Create Student Dialog
function CreateStudentDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    classId: 0,
    sectionId: undefined as number | undefined,
    academicYearId: 0,
    rollNo: "",
  });

  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: sections } = trpc.masterData.sections.useQuery(
    { classId: formData.classId },
    { enabled: !!formData.classId }
  );
  const { data: academicYears } = trpc.masterData.academicYears.useQuery();

  const createMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("Student created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.classId || !formData.academicYearId) {
      toast.error("Please fill all required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Student</DialogTitle>
        <DialogDescription>Add a new student manually to the system</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>First Name *</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Last Name *</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Date of Birth *</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "Male" | "Female" | "Other") => setFormData({ ...formData, gender: value })}
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
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Academic Year *</Label>
            <Select
              value={formData.academicYearId.toString()}
              onValueChange={(value) => setFormData({ ...formData, academicYearId: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Class *</Label>
            <Select
              value={formData.classId.toString()}
              onValueChange={(value) => setFormData({ ...formData, classId: Number(value), sectionId: undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Section</Label>
            <Select
              value={formData.sectionId?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, sectionId: Number(value) })}
              disabled={!formData.classId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections?.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Blood Group</Label>
            <Input
              placeholder="e.g., O+"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Roll Number</Label>
            <Input
              placeholder="e.g., 101"
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>City</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>State</Label>
            <Input
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Pincode</Label>
            <Input
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Student"}
        </Button>
      </DialogFooter>
    </>
  );
}
