import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Plus, Calendar, BookOpen, Users, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { toast as showToast } from "sonner";

export default function Exams() {
  const [, setLocation] = useLocation();
  const [academicYearFilter, setAcademicYearFilter] = useState<number | undefined>();
  const [classFilter, setClassFilter] = useState<number | undefined>();
  const [examTypeFilter, setExamTypeFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: academicYears } = trpc.masterData.academicYears.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: examTypes } = trpc.exams.getExamTypes.useQuery();
  const { data: subjects } = trpc.masterData.subjects.useQuery();

  const { data: exams, isLoading } = trpc.exams.getExams.useQuery({
    academicYearId: academicYearFilter,
    classId: classFilter,
    examTypeId: examTypeFilter,
    status: statusFilter,
  });

  const createExamMutation = trpc.exams.createExam.useMutation({
    onSuccess: () => {
      showToast.success("Exam created successfully");
      setIsCreateDialogOpen(false);
      trpc.useUtils().exams.getExams.invalidate();
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    examTypeId: "",
    academicYearId: "",
    classId: "",
    startDate: "",
    endDate: "",
    totalMarks: "",
    passingMarks: "",
    subjects: [] as Array<{
      subjectId: number;
      maxMarks: number;
      passingMarks: number;
      examDate: string;
    }>,
  });

  const handleCreateExam = () => {
    if (!formData.name || !formData.examTypeId || !formData.academicYearId || !formData.classId || !formData.startDate || !formData.endDate || !formData.totalMarks || !formData.passingMarks) {
      showToast.error("Please fill all required fields");
      return;
    }

    if (formData.subjects.length === 0) {
      showToast.error("Please add at least one subject");
      return;
    }

    createExamMutation.mutate({
      name: formData.name,
      examTypeId: parseInt(formData.examTypeId),
      academicYearId: parseInt(formData.academicYearId),
      classId: parseInt(formData.classId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalMarks: parseInt(formData.totalMarks),
      passingMarks: parseInt(formData.passingMarks),
      subjects: formData.subjects,
    });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        { subjectId: 0, maxMarks: 0, passingMarks: 0, examDate: "" },
      ],
    });
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...formData.subjects];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, subjects: updated });
  };

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      ONGOING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Exams Management</h1>
          <p className="text-muted-foreground">Manage exams, schedules, and marks entry</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exam Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., First Term Exam 2024"
                  />
                </div>
                <div>
                  <Label>Exam Type *</Label>
                  <Select value={formData.examTypeId} onValueChange={(value) => setFormData({ ...formData, examTypeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Academic Year *</Label>
                  <Select value={formData.academicYearId} onValueChange={(value) => setFormData({ ...formData, academicYearId: value })}>
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
                <div>
                  <Label>Class *</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Marks *</Label>
                  <Input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <Label>Passing Marks *</Label>
                  <Input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                    placeholder="e.g., 200"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base">Subjects *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subject
                  </Button>
                </div>

                {formData.subjects.map((subject, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                    <Select
                      value={subject.subjectId.toString()}
                      onValueChange={(value) => updateSubject(index, "subjectId", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Max marks"
                      value={subject.maxMarks || ""}
                      onChange={(e) => updateSubject(index, "maxMarks", parseInt(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Passing"
                      value={subject.passingMarks || ""}
                      onChange={(e) => updateSubject(index, "passingMarks", parseInt(e.target.value))}
                    />
                    <Input
                      type="date"
                      value={subject.examDate}
                      onChange={(e) => updateSubject(index, "examDate", e.target.value)}
                    />
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeSubject(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExam} disabled={createExamMutation.isPending}>
                  {createExamMutation.isPending ? "Creating..." : "Create Exam"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Select value={academicYearFilter?.toString() || "all"} onValueChange={(value) => setAcademicYearFilter(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
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
            <div>
              <Label>Class</Label>
              <Select value={classFilter?.toString() || "all"} onValueChange={(value) => setClassFilter(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
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
            <div>
              <Label>Exam Type</Label>
              <Select value={examTypeFilter?.toString() || "all"} onValueChange={(value) => setExamTypeFilter(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {examTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading exams...</div>
      ) : exams && exams.length > 0 ? (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/exams/${exam.id}`)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{exam.name}</h3>
                      {getStatusBadge(exam.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.examTypeName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{exam.className}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Total: {exam.totalMarks} | Pass: {exam.passingMarks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No exams found. Create your first exam to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
