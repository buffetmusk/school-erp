import { getDb } from "./db";
import { nanoid } from "nanoid";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  const {
    academicYears,
    classes,
    feeHeads,
    documentTypes,
    sections,
    subjects,
    classSubjects,
    staff,
    admApplications,
    feeStructures,
    feeStructureComponents,
    students,
    feeInvoices,
    feeInvoiceItems,
  } = await import("../drizzle/schema");

  console.log("Seeding master data...");

  // Academic Years
  await db.insert(academicYears).values([
    { organizationId: 1,
      name: "2025-2026",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      isActive: 1,
    },
    {
      name: "2026-2027",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      isActive: 1,
    },
  ]);

  // Classes
  await db.insert(classes).values([
    { organizationId: 1, name: "Nursery", displayOrder: 1, isActive: 1 },
    { organizationId: 1, name: "LKG", displayOrder: 2, isActive: 1 },
    { organizationId: 1, name: "UKG", displayOrder: 3, isActive: 1 },
    { organizationId: 1, name: "Grade 1", displayOrder: 4, isActive: 1 },
    { organizationId: 1, name: "Grade 2", displayOrder: 5, isActive: 1 },
    { organizationId: 1, name: "Grade 3", displayOrder: 6, isActive: 1 },
    { organizationId: 1, name: "Grade 4", displayOrder: 7, isActive: 1 },
    { organizationId: 1, name: "Grade 5", displayOrder: 8, isActive: 1 },
    { organizationId: 1, name: "Grade 6", displayOrder: 9, isActive: 1 },
    { organizationId: 1, name: "Grade 7", displayOrder: 10, isActive: 1 },
    { organizationId: 1, name: "Grade 8", displayOrder: 11, isActive: 1 },
    { organizationId: 1, name: "Grade 9", displayOrder: 12, isActive: 1 },
    { organizationId: 1, name: "Grade 10", displayOrder: 13, isActive: 1 },
  ]);

  // Fee Heads
  await db.insert(feeHeads).values([
    { organizationId: 1, name: "Tuition Fee", description: "Regular tuition charges", isActive: 1 },
    { organizationId: 1, name: "Library Fee", description: "Library access and maintenance", isActive: 1 },
    { organizationId: 1, name: "Lab Fee", description: "Science and computer lab usage", isActive: 1 },
    { organizationId: 1, name: "Sports Fee", description: "Sports facilities and equipment", isActive: 1 },
    { organizationId: 1, name: "Transport Fee", description: "School bus transportation", isActive: 1 },
    { organizationId: 1, name: "Examination Fee", description: "Exam materials and processing", isActive: 1 },
    { organizationId: 1, name: "Activity Fee", description: "Co-curricular activities", isActive: 1 },
  ]);

  // Document Types
  // Document Types
  await db.insert(documentTypes).values([
    { organizationId: 1, name: "Birth Certificate", isRequired: 1, isActive: 1 },
    { organizationId: 1, name: "Transfer Certificate", isRequired: 0, isActive: 1 },
    { organizationId: 1, name: "Aadhar Card", isRequired: 1, isActive: 1 },
    { organizationId: 1, name: "Passport Photo", isRequired: 1, isActive: 1 },
    { organizationId: 1, name: "Previous Mark Sheet", isRequired: 0, isActive: 1 },
  ]);

  // Sections
  await db.insert(sections).values([
    { organizationId: 1, name: "A", classId: 4, capacity: 40, isActive: 1 },
    { organizationId: 1, name: "B", classId: 4, capacity: 40, isActive: 1 },
    { organizationId: 1, name: "A", classId: 5, capacity: 40, isActive: 1 },
    { organizationId: 1, name: "B", classId: 5, capacity: 40, isActive: 1 },
    { organizationId: 1, name: "A", classId: 8, capacity: 35, isActive: 1 },
    { organizationId: 1, name: "B", classId: 8, capacity: 35, isActive: 1 },
  ]);

  // Subjects
  await db.insert(subjects).values([
    { organizationId: 1, name: "English", code: "ENG", description: "English Language and Literature", isActive: 1 },
    { organizationId: 1, name: "Mathematics", code: "MATH", description: "Mathematics", isActive: 1 },
    { organizationId: 1, name: "Science", code: "SCI", description: "General Science", isActive: 1 },
    { organizationId: 1, name: "Social Studies", code: "SST", description: "Social Studies", isActive: 1 },
    { organizationId: 1, name: "Hindi", code: "HIN", description: "Hindi Language", isActive: 1 },
    { organizationId: 1, name: "Computer Science", code: "CS", description: "Computer Science", isActive: 1 },
    { organizationId: 1, name: "Physical Education", code: "PE", description: "Physical Education", isActive: 1 },
  ]);

  // Class Subjects (Assign subjects to classes)
  await db.insert(classSubjects).values([
    { organizationId: 1, classId: 4, subjectId: 1, isCompulsory: 1 },
    { organizationId: 1, classId: 4, subjectId: 2, isCompulsory: 1 },
    { organizationId: 1, classId: 4, subjectId: 5, isCompulsory: 1 },
    { organizationId: 1, classId: 4, subjectId: 7, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 1, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 2, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 3, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 4, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 5, isCompulsory: 1 },
    { organizationId: 1, classId: 8, subjectId: 6, isCompulsory: 0 },
  ]);

  // Staff
  await db.insert(staff).values([
    { organizationId: 1,
      staffNo: "STAFF-001",
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@school.edu",
      phone: "9876543210",
      role: "Principal",
      department: "Administration",
      dateOfJoining: new Date("2015-06-01"),
      isActive: 1,
    },
    {
      staffNo: "STAFF-002",
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh.kumar@school.edu",
      phone: "9876543211",
      role: "Teacher",
      department: "Mathematics",
      dateOfJoining: new Date("2018-07-15"),
      isActive: 1,
    },
    {
      staffNo: "STAFF-003",
      firstName: "Anita",
      lastName: "Verma",
      email: "anita.verma@school.edu",
      phone: "9876543212",
      role: "Teacher",
      department: "English",
      dateOfJoining: new Date("2019-08-01"),
      isActive: 1,
    },
  ]);

  console.log("Seeding sample applications...");

  // Sample Applications
  const sampleApps = [
    {
      id: nanoid(),
      applicationNo: "APP-2026-00001",
      academicYearId: 2,
      classId: 4,
      firstName: "Rahul",
      lastName: "Sharma",
      dateOfBirth: new Date("2019-05-15"),
      gender: "Male",
      contactEmail: "rahul.sharma@example.com",
      contactPhone: "9876543210",
      status: "SUBMITTED",
    },
    {
      id: nanoid(),
      applicationNo: "APP-2026-00002",
      academicYearId: 2,
      classId: 5,
      firstName: "Priya",
      lastName: "Patel",
      dateOfBirth: new Date("2018-08-22"),
      gender: "Female",
      contactEmail: "priya.patel@example.com",
      contactPhone: "9876543211",
      status: "UNDER_REVIEW",
    },
    {
      id: nanoid(),
      applicationNo: "APP-2026-00003",
      academicYearId: 2,
      classId: 8,
      firstName: "Amit",
      lastName: "Kumar",
      dateOfBirth: new Date("2015-12-10"),
      gender: "Male",
      contactEmail: "amit.kumar@example.com",
      contactPhone: "9876543212",
      status: "APPROVED",
    },
  ];

  await db.insert(admApplications).values(sampleApps);

  console.log("Seeding fee structures...");

  // Fee Structures for different classes
  const feeStructureData = [
    {
      name: "Grade 1 Fees 2026-27",
      academicYearId: 2,
      classId: 4,
      totalAmount: 45000,
      isActive: 1,
      components: [
        { feeHeadId: 1, amount: 30000 },
        { feeHeadId: 2, amount: 5000 },
        { feeHeadId: 3, amount: 5000 },
        { feeHeadId: 4, amount: 3000 },
        { feeHeadId: 7, amount: 2000 },
      ],
    },
    {
      name: "Grade 5 Fees 2026-27",
      academicYearId: 2,
      classId: 8,
      totalAmount: 57500,
      isActive: 1,
      components: [
        { feeHeadId: 1, amount: 40000 },
        { feeHeadId: 2, amount: 6000 },
        { feeHeadId: 3, amount: 6000 },
        { feeHeadId: 4, amount: 3000 },
        { feeHeadId: 6, amount: 1500 },
        { feeHeadId: 7, amount: 1000 },
      ],
    },
  ];

  for (const structure of feeStructureData) {
    const [result] = await db.insert(feeStructures).values({ organizationId: 1,
      name: structure.name,
      academicYearId: structure.academicYearId,
      classId: structure.classId,
      totalAmount: structure.totalAmount,
      isActive: structure.isActive,
    });

    const structureId = Number(result.insertId);

    await db.insert(feeStructureComponents).values(
      structure.components.map((c) => ({
        feeStructureId: structureId,
        feeHeadId: c.feeHeadId,
        amount: c.amount,
      }))
    );
  }

  console.log("Seeding sample students and invoices...");

  // Create sample students from approved applications
  const sampleStudents = [
    {
      studentNo: "STU-2026-001",
      firstName: "Amit",
      lastName: "Kumar",
      dateOfBirth: new Date("2015-03-10"),
      gender: "Male",
      classId: 8,
      academicYearId: 2,
      applicationId: sampleApps[2].id,
      status: "ACTIVE",
    },
  ];

  await db.insert(students).values(sampleStudents);

  // Create sample invoice
  const [invoiceResult] = await db.insert(feeInvoices).values({ organizationId: 1,
    invoiceNo: "INV-2026-00001",
    studentId: 1,
    issueDate: new Date("2026-04-01"),
    dueDate: new Date("2026-04-15"),
    totalAmount: 57500,
    amountPaid: 0,
    status: "UNPAID",
  });

  const invoiceId = Number(invoiceResult.insertId);

  await db.insert(feeInvoiceItems).values([
    { organizationId: 1, invoiceId, feeHeadId: 1, amount: 40000 },
    { organizationId: 1, invoiceId, feeHeadId: 2, amount: 6000 },
    { organizationId: 1, invoiceId, feeHeadId: 3, amount: 6000 },
    { organizationId: 1, invoiceId, feeHeadId: 4, amount: 3000 },
    { organizationId: 1, invoiceId, feeHeadId: 6, amount: 1500 },
    { organizationId: 1, invoiceId, feeHeadId: 7, amount: 1000 },
  ]);

  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
