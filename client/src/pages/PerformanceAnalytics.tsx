import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Award, BookOpen, Users } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PerformanceAnalytics() {
  const [academicYearFilter, setAcademicYearFilter] = useState<number | undefined>();
  const [classFilter, setClassFilter] = useState<number | undefined>();
  const [examFilter, setExamFilter] = useState<number | undefined>();

  const { data: academicYears } = trpc.masterData.academicYears.useQuery();
  const { data: classes } = trpc.masterData.classes.useQuery();
  const { data: exams } = trpc.exams.getExams.useQuery({
    academicYearId: academicYearFilter,
    classId: classFilter,
  });

  const { data: analytics } = trpc.exams.getPerformanceAnalytics.useQuery({
    academicYearId: academicYearFilter,
    classId: classFilter,
    examId: examFilter,
  });

  const { data: subjectWisePerformance } = trpc.exams.getSubjectWisePerformance.useQuery({
    academicYearId: academicYearFilter,
    classId: classFilter,
    examId: examFilter,
  });

  const { data: topPerformers } = trpc.exams.getTopPerformers.useQuery({
    academicYearId: academicYearFilter,
    classId: classFilter,
    examId: examFilter,
    limit: 10,
  });

  const subjectChartData = useMemo(() => {
    if (!subjectWisePerformance) return [];
    return subjectWisePerformance.map((subject) => ({
      name: subject.subjectCode || subject.subjectName,
      average: parseFloat(Number(subject.averageMarks || 0).toFixed(2)),
      max: subject.maxMarksObtained || 0,
      min: subject.minMarksObtained || 0,
    }));
  }, [subjectWisePerformance]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">Comprehensive academic performance insights and trends</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
              <Label>Exam</Label>
              <Select value={examFilter?.toString() || "all"} onValueChange={(value) => setExamFilter(value === "all" ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="All exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams?.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{analytics?.totalStudents || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-3xl font-bold">{analytics?.totalExams || 0}</p>
              </div>
              <BookOpen className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Marks</p>
                <p className="text-3xl font-bold">{Number(analytics?.averageMarks || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Absent</p>
                <p className="text-3xl font-bold">{analytics?.totalAbsent || 0}</p>
              </div>
              <Award className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#3b82f6" name="Average" />
                  <Bar dataKey="max" fill="#10b981" name="Highest" />
                  <Bar dataKey="min" fill="#ef4444" name="Lowest" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, average }) => `${name}: ${average}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="average"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Details</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectWisePerformance && subjectWisePerformance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Highest</TableHead>
                    <TableHead>Lowest</TableHead>
                    <TableHead>Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectWisePerformance.map((subject) => (
                    <TableRow key={subject.subjectId}>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      <TableCell>{subject.totalStudents}</TableCell>
                      <TableCell>{Number(subject.averageMarks || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">{subject.maxMarksObtained}</TableCell>
                      <TableCell className="text-red-600">{subject.minMarksObtained}</TableCell>
                      <TableCell>{subject.totalAbsent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers && topPerformers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student No</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((student, index) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-bold">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </TableCell>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.studentNo}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{student.totalMarks}</TableCell>
                      <TableCell>{Number(student.averageMarks || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
