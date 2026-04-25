import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { FileText, Download, Eye, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";

export default function ReportCards() {
  const [selectedExam, setSelectedExam] = useState<number | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<number | undefined>();
  const [showPreview, setShowPreview] = useState(false);

  const { data: exams } = trpc.exams.getExams.useQuery({});
  const { data: students } = trpc.students.list.useQuery({});
  const { data: reportCard, refetch } = trpc.reportCards.getReportCard.useQuery(
    {
      studentId: selectedStudent!,
      examId: selectedExam!,
    },
    {
      enabled: !!selectedStudent && !!selectedExam,
    }
  );

  const generateReportCard = trpc.reportCards.generate.useMutation({
    onSuccess: () => {
      toast.success("Report card generated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate report card: ${error.message}`);
    },
  });

  const bulkGenerate = trpc.reportCards.bulkGenerate.useMutation({
    onSuccess: (results) => {
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      toast.success(`Generated ${successful} report cards${failed > 0 ? `, ${failed} failed` : ""}`);
    },
    onError: (error) => {
      toast.error(`Failed to generate report cards: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!selectedStudent || !selectedExam) {
      toast.error("Please select both student and exam");
      return;
    }
    generateReportCard.mutate({
      studentId: selectedStudent,
      examId: selectedExam,
    });
  };

  const handleBulkGenerate = () => {
    if (!selectedExam) {
      toast.error("Please select an exam");
      return;
    }
    if (!students || students.length === 0) {
      toast.error("No students found");
      return;
    }
    bulkGenerate.mutate({
      examId: selectedExam,
      studentIds: students.map((s) => s.id),
    });
  };

  const handlePreview = () => {
    if (reportCard) {
      setShowPreview(true);
    } else {
      toast.error("No report card available. Generate one first.");
    }
  };

  const handleDownload = () => {
    if (!reportCard) {
      toast.error("No report card available");
      return;
    }
    // Create a printable version
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(reportCard));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintableHTML = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${data.studentName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #1e40af;
          }
          .header p {
            margin: 5px 0;
            color: #64748b;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
          }
          .info-item {
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
          }
          .info-label {
            font-weight: bold;
            color: #475569;
            font-size: 12px;
          }
          .info-value {
            font-size: 16px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: bold;
            color: #1e293b;
          }
          .summary {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .grade-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #22c55e;
            color: white;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORT CARD</h1>
          <p>${data.examName} - ${data.academicYear}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Student Name</div>
            <div class="info-value">${data.studentName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Student No</div>
            <div class="info-value">${data.studentNo}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Class</div>
            <div class="info-value">${data.className}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Exam Date</div>
            <div class="info-value">${new Date(data.examDate).toLocaleDateString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Max Marks</th>
              <th>Marks Obtained</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.subjects.map((subject: any) => `
              <tr>
                <td><strong>${subject.subjectName}</strong> (${subject.subjectCode})</td>
                <td>${subject.maxMarks}</td>
                <td>${subject.isAbsent ? 'Absent' : subject.marksObtained}</td>
                <td>${subject.grade || '-'}</td>
                <td>${subject.isAbsent ? 'Absent' : (subject.marksObtained >= subject.passingMarks ? 'Pass' : 'Fail')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3 style="margin-top: 0;">Overall Performance</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Marks</div>
              <div class="summary-value">${data.marksObtained} / ${data.totalMarks}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Percentage</div>
              <div class="summary-value">${data.percentage}%</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Grade</div>
              <div class="summary-value">
                <span class="grade-badge">${data.overallGrade || 'N/A'}</span>
              </div>
            </div>
          </div>
          ${data.rank ? `
            <div style="text-align: center; margin-top: 20px; font-size: 18px;">
              <strong>Class Rank:</strong> ${data.rank}
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Generated on ${new Date(data.generatedAt).toLocaleString()}</p>
          <p>This is a computer-generated report card</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Report Cards</h1>
        <p className="text-muted-foreground">
          Generate and download student report cards
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Report Card</CardTitle>
            <CardDescription>
              Select student and exam to generate or view report card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Select Exam</Label>
                <Select
                  value={selectedExam?.toString()}
                  onValueChange={(value) => setSelectedExam(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams?.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id.toString()}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select
                  value={selectedStudent?.toString()}
                  onValueChange={(value) => setSelectedStudent(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName} ({student.studentNo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!selectedStudent || !selectedExam}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report Card
              </Button>
              {reportCard && (
                <>
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Generate</CardTitle>
            <CardDescription>
              Generate report cards for all students in an exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleBulkGenerate}
              disabled={!selectedExam}
              variant="secondary"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate for All Students
            </Button>
          </CardContent>
        </Card>

        {reportCard && (
          <Card>
            <CardHeader>
              <CardTitle>Report Card Summary</CardTitle>
              <CardDescription>
                {reportCard.studentName} - {reportCard.examName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Total Marks</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {reportCard.marksObtained} / {reportCard.totalMarks}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Percentage</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{reportCard.percentage}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Grade</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportCard.overallGrade || "N/A"}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-muted-foreground">Rank</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {reportCard.rank || "N/A"}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCard.subjects.map((subject: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {subject.subjectName}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({subject.subjectCode})
                        </span>
                      </TableCell>
                      <TableCell>{subject.maxMarks}</TableCell>
                      <TableCell>
                        {subject.isAbsent ? "Absent" : subject.marksObtained}
                      </TableCell>
                      <TableCell>
                        {subject.grade ? (
                          <Badge variant="secondary">{subject.grade}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {subject.isAbsent ? (
                          <Badge variant="destructive">Absent</Badge>
                        ) : subject.marksObtained >= subject.passingMarks ? (
                          <Badge variant="default" className="bg-green-500">
                            Pass
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Fail</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Card Preview</DialogTitle>
            <DialogDescription>
              Preview of {reportCard?.studentName}'s report card
            </DialogDescription>
          </DialogHeader>
          {reportCard && (
            <div
              dangerouslySetInnerHTML={{ __html: generatePrintableHTML(reportCard) }}
              className="border rounded-lg p-4"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
