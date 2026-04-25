const now = new Date();
const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

export const MOCK_USER = {
  id: 1,
  openId: "demo-user-001",
  name: "Dr. Priya Sharma",
  email: "priya.sharma@dps.edu.in",
  loginMethod: "oauth",
  role: "admin" as const,
  isSuperAdmin: 1,
  createdAt: yearAgo,
  updatedAt: now,
  lastSignedIn: now,
};

export const MOCK_ACADEMIC_YEARS = [
  { id: 1, organizationId: 1, name: "2025-26", startDate: new Date("2025-04-01"), endDate: new Date("2026-03-31"), isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "2026-27", startDate: new Date("2026-04-01"), endDate: new Date("2027-03-31"), isActive: 1, createdAt: now },
];

export const MOCK_CLASSES = [
  { id: 1, organizationId: 1, name: "Nursery", displayOrder: 1, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "LKG", displayOrder: 2, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "UKG", displayOrder: 3, isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, name: "Class 1", displayOrder: 4, isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, name: "Class 2", displayOrder: 5, isActive: 1, createdAt: yearAgo },
  { id: 6, organizationId: 1, name: "Class 3", displayOrder: 6, isActive: 1, createdAt: yearAgo },
  { id: 7, organizationId: 1, name: "Class 4", displayOrder: 7, isActive: 1, createdAt: yearAgo },
  { id: 8, organizationId: 1, name: "Class 5", displayOrder: 8, isActive: 1, createdAt: yearAgo },
  { id: 9, organizationId: 1, name: "Class 6", displayOrder: 9, isActive: 1, createdAt: yearAgo },
  { id: 10, organizationId: 1, name: "Class 7", displayOrder: 10, isActive: 1, createdAt: yearAgo },
  { id: 11, organizationId: 1, name: "Class 8", displayOrder: 11, isActive: 1, createdAt: yearAgo },
  { id: 12, organizationId: 1, name: "Class 9", displayOrder: 12, isActive: 1, createdAt: yearAgo },
  { id: 13, organizationId: 1, name: "Class 10", displayOrder: 13, isActive: 1, createdAt: yearAgo },
];

export const MOCK_SECTIONS = [
  { id: 1, organizationId: 1, name: "Section A", classId: 4, capacity: 40, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "Section B", classId: 4, capacity: 40, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Section A", classId: 5, capacity: 40, isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, name: "Section B", classId: 5, capacity: 40, isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, name: "Section A", classId: 6, capacity: 35, isActive: 1, createdAt: yearAgo },
];

export const MOCK_FEE_HEADS = [
  { id: 1, organizationId: 1, name: "Tuition Fee", description: "Monthly tuition", isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "Development Fee", description: "Annual development charge", isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Lab Fee", description: "Science and computer lab", isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, name: "Library Fee", description: "Library access", isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, name: "Transport Fee", description: "Bus transport", isActive: 1, createdAt: yearAgo },
];

export const MOCK_DOCUMENT_TYPES = [
  { id: 1, organizationId: 1, name: "Birth Certificate", isRequired: 1, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "Aadhaar Card", isRequired: 1, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Transfer Certificate", isRequired: 0, isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, name: "Passport Photo", isRequired: 1, isActive: 1, createdAt: yearAgo },
];

export const MOCK_SUBJECTS = [
  { id: 1, organizationId: 1, name: "Mathematics", code: "MATH", description: null, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "English", code: "ENG", description: null, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Hindi", code: "HIN", description: null, isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, name: "Science", code: "SCI", description: null, isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, name: "Social Studies", code: "SST", description: null, isActive: 1, createdAt: yearAgo },
  { id: 6, organizationId: 1, name: "Computer Science", code: "CS", description: null, isActive: 1, createdAt: yearAgo },
];

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Sai", "Ananya", "Diya", "Myra", "Sara", "Aadhya", "Isha", "Kiara", "Riya", "Pari", "Avni", "Kabir", "Dhruv", "Arnav", "Lakshya", "Rohan", "Tanvi", "Meera", "Nisha", "Priya", "Shreya"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Jain", "Mehta", "Reddy", "Nair", "Iyer", "Rao", "Bhat", "Desai", "Mishra"];

function mockStudents() {
  const result = [];
  let id = 1;
  for (const cls of MOCK_CLASSES) {
    const count = cls.id <= 3 ? 15 : cls.id <= 8 ? 32 : 28;
    for (let i = 0; i < count; i++) {
      const fn = firstNames[(id * 7 + i * 3) % firstNames.length];
      const ln = lastNames[(id * 5 + i * 2) % lastNames.length];
      const gender = i % 3 === 0 ? "Female" : "Male";
      result.push({
        id,
        organizationId: 1,
        studentNo: `STU-2025-${String(id).padStart(3, "0")}`,
        firstName: fn,
        lastName: ln,
        dateOfBirth: new Date(2012 + (cls.id <= 3 ? 6 : 13 - cls.id), (id * 3) % 12, (id * 7) % 28 + 1),
        gender,
        bloodGroup: ["A+", "B+", "O+", "AB+", "A-"][id % 5],
        address: `${100 + id}, Sector ${10 + (id % 20)}`,
        city: "New Delhi",
        state: "Delhi",
        pincode: "110" + String(1 + (id % 99)).padStart(3, "0"),
        classId: cls.id,
        sectionId: cls.id >= 4 ? ((id % 2) + (cls.id - 4) * 2 + 1) : null,
        academicYearId: 2,
        rollNo: String(i + 1),
        applicationId: null,
        status: "ACTIVE",
        admissionDate: yearAgo,
        createdAt: yearAgo,
        updatedAt: now,
      });
      id++;
    }
  }
  return result;
}

export const MOCK_STUDENTS = mockStudents();

export const MOCK_APPLICATIONS = [
  { id: "app-001", applicationNo: "APP-2026-00001", academicYearId: 2, classId: 1, firstName: "Aryan", lastName: "Kapoor", dateOfBirth: new Date("2021-03-15"), gender: "Male", contactEmail: "kapoor@email.com", contactPhone: "+919876543210", status: "SUBMITTED", submittedAt: new Date("2026-04-10"), createdBy: 1, updatedAt: now, className: "Nursery", academicYear: "2026-27" },
  { id: "app-002", applicationNo: "APP-2026-00002", academicYearId: 2, classId: 2, firstName: "Aanya", lastName: "Mehra", dateOfBirth: new Date("2020-07-22"), gender: "Female", contactEmail: "mehra@email.com", contactPhone: "+919876543211", status: "UNDER_REVIEW", submittedAt: new Date("2026-04-08"), createdBy: 1, updatedAt: now, className: "LKG", academicYear: "2026-27" },
  { id: "app-003", applicationNo: "APP-2026-00003", academicYearId: 2, classId: 4, firstName: "Veer", lastName: "Malhotra", dateOfBirth: new Date("2019-11-05"), gender: "Male", contactEmail: "malhotra@email.com", contactPhone: "+919876543212", status: "APPROVED", submittedAt: new Date("2026-04-01"), createdBy: 1, updatedAt: now, className: "Class 1", academicYear: "2026-27" },
  { id: "app-004", applicationNo: "APP-2026-00004", academicYearId: 2, classId: 5, firstName: "Mira", lastName: "Shah", dateOfBirth: new Date("2018-01-30"), gender: "Female", contactEmail: "shah@email.com", contactPhone: "+919876543213", status: "APPROVED", submittedAt: new Date("2026-03-28"), createdBy: 1, updatedAt: now, className: "Class 2", academicYear: "2026-27" },
  { id: "app-005", applicationNo: "APP-2026-00005", academicYearId: 2, classId: 3, firstName: "Rehan", lastName: "Khan", dateOfBirth: new Date("2020-05-14"), gender: "Male", contactEmail: "khan@email.com", contactPhone: "+919876543214", status: "REJECTED", submittedAt: new Date("2026-03-25"), createdBy: 1, updatedAt: now, className: "UKG", academicYear: "2026-27" },
  { id: "app-006", applicationNo: "APP-2026-00006", academicYearId: 2, classId: 1, firstName: "Ira", lastName: "Dasgupta", dateOfBirth: new Date("2021-09-08"), gender: "Female", contactEmail: "dasgupta@email.com", contactPhone: "+919876543215", status: "SUBMITTED", submittedAt: new Date("2026-04-15"), createdBy: 1, updatedAt: now, className: "Nursery", academicYear: "2026-27" },
  { id: "app-007", applicationNo: "APP-2026-00007", academicYearId: 2, classId: 6, firstName: "Kabir", lastName: "Joshi", dateOfBirth: new Date("2017-12-20"), gender: "Male", contactEmail: "joshi@email.com", contactPhone: "+919876543216", status: "UNDER_REVIEW", submittedAt: new Date("2026-04-12"), createdBy: 1, updatedAt: now, className: "Class 3", academicYear: "2026-27" },
  { id: "app-008", applicationNo: "APP-2026-00008", academicYearId: 2, classId: 4, firstName: "Zara", lastName: "Ahmad", dateOfBirth: new Date("2019-06-25"), gender: "Female", contactEmail: "ahmad@email.com", contactPhone: "+919876543217", status: "APPROVED", submittedAt: new Date("2026-04-05"), createdBy: 1, updatedAt: now, className: "Class 1", academicYear: "2026-27" },
];

export const MOCK_FEE_STRUCTURES = [
  { id: 1, name: "Nursery Fee 2026-27", className: "Nursery", academicYear: "2026-27", totalAmount: 48000, isActive: 1 },
  { id: 2, name: "LKG Fee 2026-27", className: "LKG", academicYear: "2026-27", totalAmount: 52000, isActive: 1 },
  { id: 3, name: "UKG Fee 2026-27", className: "UKG", academicYear: "2026-27", totalAmount: 52000, isActive: 1 },
  { id: 4, name: "Class 1-5 Fee 2026-27", className: "Class 1", academicYear: "2026-27", totalAmount: 65000, isActive: 1 },
  { id: 5, name: "Class 6-8 Fee 2026-27", className: "Class 6", academicYear: "2026-27", totalAmount: 72000, isActive: 1 },
  { id: 6, name: "Class 9-10 Fee 2026-27", className: "Class 9", academicYear: "2026-27", totalAmount: 85000, isActive: 1 },
];

function mockInvoices() {
  const statuses = ["PAID", "PAID", "PAID", "PAID", "PARTIALLY_PAID", "UNPAID", "PAID", "PAID", "UNPAID", "PAID"];
  const result = [];
  for (let i = 1; i <= 60; i++) {
    const status = statuses[i % statuses.length];
    const totalAmount = [48000, 52000, 65000, 72000, 85000][i % 5];
    const amountPaid = status === "PAID" ? totalAmount : status === "PARTIALLY_PAID" ? Math.floor(totalAmount * 0.6) : 0;
    result.push({
      id: i,
      invoiceNo: `INV-2026-${String(i).padStart(4, "0")}`,
      studentName: firstNames[i % firstNames.length],
      totalAmount,
      amountPaid,
      dueDate: new Date(2026, 5 + (i % 6), 15),
      status,
    });
  }
  return result;
}

export const MOCK_INVOICES = mockInvoices();

export const MOCK_STAFF = [
  { id: 1, organizationId: 1, staffNo: "TCH-001", firstName: "Radhika", lastName: "Iyer", email: "radhika@dps.edu.in", phone: "+919876543220", role: "Teacher", department: "Mathematics", dateOfJoining: new Date("2020-06-15"), isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, staffNo: "TCH-002", firstName: "Amit", lastName: "Srivastava", email: "amit@dps.edu.in", phone: "+919876543221", role: "Teacher", department: "English", dateOfJoining: new Date("2019-04-01"), isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, staffNo: "TCH-003", firstName: "Neha", lastName: "Pandey", email: "neha@dps.edu.in", phone: "+919876543222", role: "Teacher", department: "Science", dateOfJoining: new Date("2021-07-10"), isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, staffNo: "ADM-001", firstName: "Suresh", lastName: "Pillai", email: "suresh@dps.edu.in", phone: "+919876543223", role: "Accountant", department: "Finance", dateOfJoining: new Date("2018-01-20"), isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, staffNo: "ADM-002", firstName: "Kavita", lastName: "Deshmukh", email: "kavita@dps.edu.in", phone: "+919876543224", role: "Admin", department: "Administration", dateOfJoining: new Date("2017-08-01"), isActive: 1, createdAt: yearAgo },
  { id: 6, organizationId: 1, staffNo: "TCH-004", firstName: "Deepak", lastName: "Chandra", email: "deepak@dps.edu.in", phone: "+919876543225", role: "Teacher", department: "Hindi", dateOfJoining: new Date("2022-03-15"), isActive: 1, createdAt: yearAgo },
];

export const MOCK_EXAM_TYPES = [
  { id: 1, organizationId: 1, name: "Unit Test", description: "Monthly unit test", weightage: 20, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "Mid-Term", description: "Half-yearly examination", weightage: 30, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Final", description: "Annual examination", weightage: 50, isActive: 1, createdAt: yearAgo },
];

export const MOCK_GRADE_SCALES = [
  { id: 1, organizationId: 1, gradeName: "A+", minPercentage: 90, maxPercentage: 100, gradePoints: 10, description: "Outstanding", displayOrder: 1, isActive: 1, createdAt: yearAgo },
  { id: 2, organizationId: 1, gradeName: "A", minPercentage: 80, maxPercentage: 89, gradePoints: 9, description: "Excellent", displayOrder: 2, isActive: 1, createdAt: yearAgo },
  { id: 3, organizationId: 1, gradeName: "B+", minPercentage: 70, maxPercentage: 79, gradePoints: 8, description: "Very Good", displayOrder: 3, isActive: 1, createdAt: yearAgo },
  { id: 4, organizationId: 1, gradeName: "B", minPercentage: 60, maxPercentage: 69, gradePoints: 7, description: "Good", displayOrder: 4, isActive: 1, createdAt: yearAgo },
  { id: 5, organizationId: 1, gradeName: "C", minPercentage: 50, maxPercentage: 59, gradePoints: 6, description: "Average", displayOrder: 5, isActive: 1, createdAt: yearAgo },
  { id: 6, organizationId: 1, gradeName: "D", minPercentage: 33, maxPercentage: 49, gradePoints: 4, description: "Below Average", displayOrder: 6, isActive: 1, createdAt: yearAgo },
  { id: 7, organizationId: 1, gradeName: "F", minPercentage: 0, maxPercentage: 32, gradePoints: 0, description: "Fail", displayOrder: 7, isActive: 1, createdAt: yearAgo },
];

export function getMockStudentAnalytics() {
  const students = MOCK_STUDENTS;
  const byClass: Record<number, number> = {};
  const byGender: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  students.forEach((s) => {
    byClass[s.classId] = (byClass[s.classId] || 0) + 1;
    byGender[s.gender] = (byGender[s.gender] || 0) + 1;
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  return {
    total: students.length,
    active: students.length,
    inactive: 0,
    byClass,
    byGender,
    byStatus,
  };
}

export function getMockFinancialAnalytics() {
  const invoices = MOCK_INVOICES;
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return {
    totalBilled,
    totalCollected,
    totalPending: totalBilled - totalCollected,
    collectionRate: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
    invoiceCount: invoices.length,
    paidCount: invoices.filter((i) => i.status === "PAID").length,
    partiallyPaidCount: invoices.filter((i) => i.status === "PARTIALLY_PAID").length,
    unpaidCount: invoices.filter((i) => i.status === "UNPAID").length,
  };
}

export const MOCK_LEAVE_TYPES = [
  { id: 1, organizationId: 1, name: "Casual Leave", maxDaysPerYear: 12, isPaid: 1, description: "For personal matters", createdAt: yearAgo },
  { id: 2, organizationId: 1, name: "Sick Leave", maxDaysPerYear: 10, isPaid: 1, description: "Medical leave", createdAt: yearAgo },
  { id: 3, organizationId: 1, name: "Earned Leave", maxDaysPerYear: 15, isPaid: 1, description: "Accumulated leave", createdAt: yearAgo },
];

export const MOCK_MESSAGE_TEMPLATES = [
  { id: 1, organizationId: 1, name: "Fee Reminder", category: "fees" as const, channel: "sms" as const, subject: "Fee Due Reminder", content: "Dear {parentName}, this is a reminder that fee of Rs {amount} for {studentName} is due on {dueDate}.", variables: JSON.stringify(["parentName", "amount", "studentName", "dueDate"]), isActive: 1, createdBy: 1, createdAt: yearAgo, updatedAt: now },
  { id: 2, organizationId: 1, name: "Attendance Alert", category: "attendance" as const, channel: "whatsapp" as const, subject: "Absence Notification", content: "Dear {parentName}, {studentName} was marked absent today.", variables: JSON.stringify(["parentName", "studentName"]), isActive: 1, createdBy: 1, createdAt: yearAgo, updatedAt: now },
];
