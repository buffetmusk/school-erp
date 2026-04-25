import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowLeft, Calendar, BookOpen, Users, Save } from "lucide-react";
import { toast as showToast } from "sonner";

export default function ExamDetails() {
  const [, params] = useRoute("/exams/:id");
  const [, setLocation] = useLocation();
  const examId = params?.id ? parseInt(params.id) : 0;

  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
  const [marksData, setMarksData] = useState<Record<string, { marksObtained: number; isAbsent: boolean; remarks: string }>>({});

  const { data: exam, isLoading } = trpc.exams.getExamById.useQuery({ id: examId });
  const { data: studentsData } = trpc.students.list.useQuery(
    { classId: exam?.classId },
    { enabled: !!exam?.classId }
  );
  const students = studentsData || [];

  const { data: examMarks } = trpc.exams.getExamMarks.useQuery(
    { examId, subjectId: selectedSubject },
    { enabled: !!examId && !!selectedSubject }
  );

  const bulkEnterMarksMutation = trpc.exams.bulkEnterMarks.useMutation({
    onSuccess: () => {
      showToast.success("Marks saved successfully");
      trpc.useUtils().exams.getExamMarks.invalidate();
      setMarksData({});
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });

  const updateExamStatusMutation = trpc.exams.updateExamStatus.useMutation({
    onSuccess: () => {
      showToast.success("Exam status updated");
      trpc.useUtils().exams.getExamById.invalidate();
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });

  const handleMarkChange = (studentId: number, examSubjectId: number, field: string, value: any) => {
    const key = `${studentId}-${examSubjectId}`;
    setMarksData({
      ...marksData,
      [key]: {
        ...marksData[key],
        [field]: value,
      },
    });
  };

  const handleSaveMarks = () => {
    if (!selectedSubject) {
      showToast.error("Please select a subject");
      return;
    }

    const examSubject = exam?.subjects?.find((s) => s.subjectId === selectedSubject);
    if (!examSubject) {
      showToast.error("Invalid subject selected");
      return;
    }

    const marks = Object.entries(marksData).map(([key, data]) => {
      const [studentId] = key.split("-");
      return {
        studentId: parseInt(studentId),
        examSubjectId: examSubject.id,
        marksObtained: data.marksObtained || 0,
        isAbsent: data.isAbsent ? 1 : 0,
        remarks: data.remarks || "",
      };
    });

    if (marks.length === 0) {
      showToast.error("No marks to save");
      return;
    }

    bulkEnterMarksMutation.mutate({ marks });
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

  if (isLoading) {
    return <div className="p-6 text-center">Loading exam details...</div>;
  }

  if (!exam) {
    return <div className="p-6 text-center">Exam not found</div>;
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => setLocation("/exams")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exams
      </Button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{exam.name}</h1>
            {getStatusBadge(exam.status)}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{exam.examTypeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{exam.className}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {exam.status === "SCHEDULED" && (
            <Button onClick={() => updateExamStatusMutation.mutate({ id: examId, status: "ONGOING" })}>
              Start Exam
            </Button>
          )}
          {exam.status === "ONGOING" && (
            <Button onClick={() => updateExamStatusMutation.mutate({ id: examId, status: "COMPLETED" })}>
              Complete Exam
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Academic Year</Label>
                    <p className="font-medium">{exam.academicYear}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Class</Label>
                    <p className="font-medium">{exam.className}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Marks</Label>
                    <p className="font-medium">{exam.totalMarks}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Passing Marks</Label>
                    <p className="font-medium">{exam.passingMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Passing Marks</TableHead>
                      <TableHead>Exam Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.subjects?.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell>{subject.subjectCode}</TableCell>
                        <TableCell>{subject.maxMarks}</TableCell>
                        <TableCell>{subject.passingMarks}</TableCell>
                        <TableCell>{new Date(subject.examDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Enter Marks</CardTitle>
                <div className="flex gap-2 items-center">
                  <Label>Select Subject:</Label>
                  <Select value={selectedSubject?.toString()} onValueChange={(value) => setSelectedSubject(parseInt(value))}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {exam.subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.subjectId.toString()}>
                          {subject.subjectName} ({subject.maxMarks} marks)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveMarks} disabled={!selectedSubject || bulkEnterMarksMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {bulkEnterMarksMutation.isPending ? "Saving..." : "Save Marks"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSubject ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students?.map((student: any) => {
                      const examSubject = exam.subjects?.find((s) => s.subjectId === selectedSubject);
                      const key = `${student.id}-${examSubject?.id}`;
                      const existingMark = examMarks?.find((m) => m.studentId === student.id);
                      const currentData = marksData[key] || {
                        marksObtained: existingMark?.marksObtained || 0,
                        isAbsent: existingMark?.isAbsent === 1,
                        remarks: existingMark?.remarks || "",
                      };

                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.studentNo}</TableCell>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={examSubject?.maxMarks || 100}
                              value={currentData.marksObtained || ""}
                              onChange={(e) =>
                                handleMarkChange(student.id, examSubject?.id || 0, "marksObtained", parseInt(e.target.value) || 0)
                              }
                              disabled={currentData.isAbsent}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={currentData.isAbsent}
                              onChange={(e) => handleMarkChange(student.id, examSubject?.id || 0, "isAbsent", e.target.checked)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={currentData.remarks || ""}
                              onChange={(e) => handleMarkChange(student.id, examSubject?.id || 0, "remarks", e.target.value)}
                              placeholder="Optional"
                              className="w-48"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">Please select a subject to enter marks</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Results view will be available after marks entry is completed
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
