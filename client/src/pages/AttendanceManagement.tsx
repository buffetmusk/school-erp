import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

export default function AttendanceManagement() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, "present" | "absent" | "late" | "half_day">>({});

  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: students, isLoading: studentsLoading } = trpc.students.list.useQuery(
    { classId: selectedClass ? parseInt(selectedClass) : undefined },
    { enabled: !!selectedClass }
  );

  const bulkMarkMutation = trpc.attendance.bulkMarkAttendance.useMutation({
    onSuccess: () => {
      toast.success("Attendance marked successfully");
      setAttendanceRecords({});
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleMarkAll = (status: "present" | "absent") => {
    if (!students) return;
    const records: Record<number, "present" | "absent" | "late" | "half_day"> = {};
    students.forEach((student) => {
      records[student.id] = status;
    });
    setAttendanceRecords(records);
  };

  const handleSubmit = () => {
    if (!selectedClass || Object.keys(attendanceRecords).length === 0) {
      toast.error("Please select a class and mark attendance");
      return;
    }

    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId: parseInt(studentId),
      date: new Date(selectedDate),
      status,
    }));

    bulkMarkMutation.mutate({ records });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "half_day":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Mark daily attendance for students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class and Date</CardTitle>
          <CardDescription>Choose the class and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            <div className="space-y-2">
              <Label>Date</Label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  {students?.length || 0} students in selected class
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll("present")}
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll("absent")}
                >
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : students && students.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.studentNo}</TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          {attendanceRecords[student.id] ? (
                            <Badge
                              variant={
                                attendanceRecords[student.id] === "present"
                                  ? "default"
                                  : attendanceRecords[student.id] === "absent"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {getStatusIcon(attendanceRecords[student.id])}
                              {attendanceRecords[student.id]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not marked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={attendanceRecords[student.id] === "present" ? "default" : "outline"}
                              onClick={() =>
                                setAttendanceRecords((prev) => ({ ...prev, [student.id]: "present" }))
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendanceRecords[student.id] === "absent" ? "destructive" : "outline"}
                              onClick={() =>
                                setAttendanceRecords((prev) => ({ ...prev, [student.id]: "absent" }))
                              }
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={attendanceRecords[student.id] === "late" ? "secondary" : "outline"}
                              onClick={() =>
                                setAttendanceRecords((prev) => ({ ...prev, [student.id]: "late" }))
                              }
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={bulkMarkMutation.isPending || Object.keys(attendanceRecords).length === 0}
                  >
                    {bulkMarkMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Attendance"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No students found in selected class
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
