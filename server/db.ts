import { eq, desc, and, sql } from "drizzle-orm";
import { InsertUser, users, staffSalaries, staffPayments, staffLeaves, leaveTypes, staff } from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  MOCK_USER, MOCK_ACADEMIC_YEARS, MOCK_CLASSES, MOCK_SECTIONS,
  MOCK_FEE_HEADS, MOCK_DOCUMENT_TYPES, MOCK_SUBJECTS, MOCK_STUDENTS,
  MOCK_APPLICATIONS, MOCK_FEE_STRUCTURES, MOCK_INVOICES, MOCK_STAFF,
  MOCK_EXAM_TYPES, MOCK_GRADE_SCALES, MOCK_LEAVE_TYPES, MOCK_MESSAGE_TEMPLATES,
  getMockStudentAnalytics, getMockFinancialAnalytics,
} from "./mock";

let _db: any | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const { drizzle } = await import("drizzle-orm/mysql2");
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return MOCK_USER as any;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Master Data Queries
export async function getAcademicYears() {
  const db = await getDb();
  if (!db) return MOCK_ACADEMIC_YEARS;
  const { academicYears } = await import("../drizzle/schema");
  return db.select().from(academicYears).where(eq(academicYears.isActive, 1));
}

export async function getClasses() {
  const db = await getDb();
  if (!db) return MOCK_CLASSES;
  const { classes } = await import("../drizzle/schema");
  return db.select().from(classes).where(eq(classes.isActive, 1)).orderBy(classes.displayOrder);
}

export async function getFeeHeads() {
  const db = await getDb();
  if (!db) return MOCK_FEE_HEADS;
  const { feeHeads } = await import("../drizzle/schema");
  return db.select().from(feeHeads).where(eq(feeHeads.isActive, 1));
}

export async function getDocumentTypes() {
  const db = await getDb();
  if (!db) return MOCK_DOCUMENT_TYPES;
  const { documentTypes } = await import("../drizzle/schema");
  return db.select().from(documentTypes).where(eq(documentTypes.isActive, 1));
}

// Admissions Queries
export async function createApplication(data: {
  id: string;
  applicationNo: string;
  academicYearId: number;
  classId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  contactEmail?: string;
  contactPhone?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return data;
  const { admApplications } = await import("../drizzle/schema");
  await db.insert(admApplications).values(data);
  return data;
}

export async function getApplicationsRaw() {
  const db = await getDb();
  if (!db) return MOCK_APPLICATIONS;
  const { admApplications } = await import("../drizzle/schema");
  return await db.select().from(admApplications);
}

export async function getApplications(filters?: {
  academicYearId?: number;
  classId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) {
    let result = MOCK_APPLICATIONS.map(a => ({
      id: a.id, applicationNo: a.applicationNo, firstName: a.firstName,
      lastName: a.lastName, className: a.className, academicYear: a.academicYear,
      status: a.status, submittedAt: a.submittedAt,
    }));
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    return result;
  }
  const { admApplications, academicYears, classes } = await import("../drizzle/schema");
  
  let query = db
    .select({
      id: admApplications.id,
      applicationNo: admApplications.applicationNo,
      firstName: admApplications.firstName,
      lastName: admApplications.lastName,
      className: classes.name,
      academicYear: academicYears.name,
      status: admApplications.status,
      submittedAt: admApplications.submittedAt,
    })
    .from(admApplications)
    .leftJoin(classes, eq(admApplications.classId, classes.id))
    .leftJoin(academicYears, eq(admApplications.academicYearId, academicYears.id));

  if (filters?.academicYearId) {
    query = query.where(eq(admApplications.academicYearId, filters.academicYearId)) as any;
  }
  if (filters?.classId) {
    query = query.where(eq(admApplications.classId, filters.classId)) as any;
  }
  if (filters?.status) {
    query = query.where(eq(admApplications.status, filters.status)) as any;
  }

  return query;
}

export async function getApplicationById(id: string) {
  const db = await getDb();
  if (!db) {
    const app = MOCK_APPLICATIONS.find(a => a.id === id);
    if (!app) return null;
    return { ...app, documents: [] };
  }
  const { admApplications, academicYears, classes, admApplicationDocuments, documentTypes } = await import("../drizzle/schema");
  
  const [application] = await db
    .select({
      id: admApplications.id,
      applicationNo: admApplications.applicationNo,
      academicYearId: admApplications.academicYearId,
      academicYear: academicYears.name,
      classId: admApplications.classId,
      className: classes.name,
      firstName: admApplications.firstName,
      lastName: admApplications.lastName,
      dateOfBirth: admApplications.dateOfBirth,
      gender: admApplications.gender,
      contactEmail: admApplications.contactEmail,
      contactPhone: admApplications.contactPhone,
      status: admApplications.status,
      submittedAt: admApplications.submittedAt,
    })
    .from(admApplications)
    .leftJoin(classes, eq(admApplications.classId, classes.id))
    .leftJoin(academicYears, eq(admApplications.academicYearId, academicYears.id))
    .where(eq(admApplications.id, id))
    .limit(1);

  if (!application) return null;

  const documents = await db
    .select({
      id: admApplicationDocuments.id,
      documentType: documentTypes.name,
      filePath: admApplicationDocuments.filePath,
      uploadedAt: admApplicationDocuments.uploadedAt,
    })
    .from(admApplicationDocuments)
    .leftJoin(documentTypes, eq(admApplicationDocuments.documentTypeId, documentTypes.id))
    .where(eq(admApplicationDocuments.applicationId, id));

  return { ...application, documents };
}

export async function updateApplicationStatus(data: {
  applicationId: string;
  newStatus: string;
  remarks?: string;
  changedBy?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true };
  const { admApplications, admApplicationStatusHistory } = await import("../drizzle/schema");

  const [current] = await db
    .select({ status: admApplications.status })
    .from(admApplications)
    .where(eq(admApplications.id, data.applicationId))
    .limit(1);

  await db.update(admApplications)
    .set({ status: data.newStatus, updatedAt: new Date() })
    .where(eq(admApplications.id, data.applicationId));

  await db.insert(admApplicationStatusHistory).values({
    applicationId: data.applicationId,
    oldStatus: current?.status || null,
    newStatus: data.newStatus,
    changedBy: data.changedBy,
    remarks: data.remarks,
  });

  return { success: true };
}

// Fees Queries
export async function createFeeStructure(data: {
  name: string;
  academicYearId: number;
  classId: number;
  components: Array<{ feeHeadId: number; amount: number }>;
}) {
  const db = await getDb();
  if (!db) return { id: 999, totalAmount: data.components.reduce((s, c) => s + c.amount, 0) };
  const { feeStructures, feeStructureComponents } = await import("../drizzle/schema");

  const totalAmount = data.components.reduce((sum, c) => sum + c.amount, 0);

  const [result] = await db.insert(feeStructures).values({
    name: data.name,
    academicYearId: data.academicYearId,
    classId: data.classId,
    totalAmount,
  });

  const structureId = Number(result.insertId);

  await db.insert(feeStructureComponents).values(
    data.components.map(c => ({
      feeStructureId: structureId,
      feeHeadId: c.feeHeadId,
      amount: c.amount,
    }))
  );

  return { id: structureId, totalAmount };
}

export async function getFeeStructures(filters?: {
  academicYearId?: number;
  classId?: number;
}) {
  const db = await getDb();
  if (!db) return MOCK_FEE_STRUCTURES;
  const { feeStructures, academicYears, classes } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");

  const conditions = [eq(feeStructures.isActive, 1)];
  if (filters?.academicYearId) {
    conditions.push(eq(feeStructures.academicYearId, filters.academicYearId));
  }
  if (filters?.classId) {
    conditions.push(eq(feeStructures.classId, filters.classId));
  }

  return db
    .select({
      id: feeStructures.id,
      name: feeStructures.name,
      className: classes.name,
      academicYear: academicYears.name,
      totalAmount: feeStructures.totalAmount,
      isActive: feeStructures.isActive,
    })
    .from(feeStructures)
    .leftJoin(classes, eq(feeStructures.classId, classes.id))
    .leftJoin(academicYears, eq(feeStructures.academicYearId, academicYears.id))
    .where(and(...conditions));
}

export async function getFeeStructureById(id: number) {
  const db = await getDb();
  if (!db) {
    const structure = MOCK_FEE_STRUCTURES.find(s => s.id === id);
    return structure ? { ...structure, components: MOCK_FEE_HEADS.map(h => ({ feeHead: h.name, amount: Math.floor(structure.totalAmount / MOCK_FEE_HEADS.length) })) } : null;
  }
  const { feeStructures, feeStructureComponents, feeHeads } = await import("../drizzle/schema");

  const [structure] = await db
    .select()
    .from(feeStructures)
    .where(eq(feeStructures.id, id))
    .limit(1);

  if (!structure) return null;

  const components = await db
    .select({
      feeHead: feeHeads.name,
      amount: feeStructureComponents.amount,
    })
    .from(feeStructureComponents)
    .leftJoin(feeHeads, eq(feeStructureComponents.feeHeadId, feeHeads.id))
    .where(eq(feeStructureComponents.feeStructureId, id));

  return { ...structure, components };
}

export async function getInvoices(filters?: {
  studentId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) {
    let result = [...MOCK_INVOICES];
    if (filters?.status) result = result.filter(i => i.status === filters.status);
    return result;
  }
  const { feeInvoices, students } = await import("../drizzle/schema");

  let query = db
    .select({
      id: feeInvoices.id,
      invoiceNo: feeInvoices.invoiceNo,
      studentName: students.firstName,
      totalAmount: feeInvoices.totalAmount,
      amountPaid: feeInvoices.amountPaid,
      dueDate: feeInvoices.dueDate,
      status: feeInvoices.status,
    })
    .from(feeInvoices)
    .leftJoin(students, eq(feeInvoices.studentId, students.id));

  if (filters?.studentId) {
    query = query.where(eq(feeInvoices.studentId, filters.studentId)) as any;
  }
  if (filters?.status) {
    query = query.where(eq(feeInvoices.status, filters.status)) as any;
  }

  return query;
}

export async function recordPayment(data: {
  id: string;
  studentId: number;
  invoiceId: number;
  amountPaid: number;
  paymentDate: Date;
  paymentMode: string;
  transactionRef?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true };
  const { feePayments, feeInvoices } = await import("../drizzle/schema");

  await db.insert(feePayments).values(data);

  const [invoice] = await db
    .select()
    .from(feeInvoices)
    .where(eq(feeInvoices.id, data.invoiceId))
    .limit(1);

  if (invoice) {
    const newAmountPaid = invoice.amountPaid + data.amountPaid;
    const newStatus = newAmountPaid >= invoice.totalAmount ? "PAID" : "PARTIALLY_PAID";

    await db.update(feeInvoices)
      .set({ amountPaid: newAmountPaid, status: newStatus })
      .where(eq(feeInvoices.id, data.invoiceId));

    return { success: true, newStatus };
  }

  return { success: true };
}

// ============================================
// MASTER DATA CRUD HELPERS
// ============================================

import {
  academicYears,
  classes,
  feeHeads,
  documentTypes,
  sections,
  subjects,
  classSubjects,
} from "../drizzle/schema";

// Academic Years
export async function createAcademicYear(data: {
  name: string;
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) return { id: 999, ...data };
  
  const [result] = await db.insert(academicYears).values({
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateAcademicYear(id: number, data: {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(academicYears).set(data).where(eq(academicYears.id, id));
  return { success: true };
}

export async function deleteAcademicYear(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(academicYears).set({ isActive: 0 }).where(eq(academicYears.id, id));
  return { success: true };
}

// Classes
export async function createClass(data: {
  name: string;
  displayOrder: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(classes).values({
    name: data.name,
    displayOrder: data.displayOrder,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateClass(id: number, data: {
  name?: string;
  displayOrder?: number;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(classes).set(data).where(eq(classes.id, id));
  return { success: true };
}

export async function deleteClass(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(classes).set({ isActive: 0 }).where(eq(classes.id, id));
  return { success: true };
}

// Sections
export async function getSectionsByClass(classId: number) {
  const db = await getDb();
  if (!db) return MOCK_SECTIONS.filter(s => s.classId === classId);
  
  return await db.select().from(sections).where(eq(sections.classId, classId));
}

export async function createSection(data: {
  name: string;
  classId: number;
  capacity?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(sections).values({
    name: data.name,
    classId: data.classId,
    capacity: data.capacity || 40,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateSection(id: number, data: {
  name?: string;
  capacity?: number;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(sections).set(data).where(eq(sections.id, id));
  return { success: true };
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(sections).set({ isActive: 0 }).where(eq(sections.id, id));
  return { success: true };
}

// Fee Heads
export async function createFeeHead(data: {
  name: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(feeHeads).values({
    name: data.name,
    description: data.description,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateFeeHead(id: number, data: {
  name?: string;
  description?: string;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(feeHeads).set(data).where(eq(feeHeads.id, id));
  return { success: true };
}

export async function deleteFeeHead(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(feeHeads).set({ isActive: 0 }).where(eq(feeHeads.id, id));
  return { success: true };
}

// Subjects
export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return MOCK_SUBJECTS;
  
  return await db.select().from(subjects).where(eq(subjects.isActive, 1));
}

export async function createSubject(data: {
  name: string;
  code: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(subjects).values({
    name: data.name,
    code: data.code,
    description: data.description,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateSubject(id: number, data: {
  name?: string;
  code?: string;
  description?: string;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(subjects).set(data).where(eq(subjects.id, id));
  return { success: true };
}

export async function deleteSubject(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(subjects).set({ isActive: 0 }).where(eq(subjects.id, id));
  return { success: true };
}

// Document Types
export async function createDocumentType(data: {
  name: string;
  isRequired: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(documentTypes).values({
    name: data.name,
    isRequired: data.isRequired,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateDocumentType(id: number, data: {
  name?: string;
  isRequired?: number;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(documentTypes).set(data).where(eq(documentTypes.id, id));
  return { success: true };
}

export async function deleteDocumentType(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(documentTypes).set({ isActive: 0 }).where(eq(documentTypes.id, id));
  return { success: true };
}

// Staff
export async function getAllStaff() {
  const db = await getDb();
  if (!db) return MOCK_STAFF;
  
  return await db.select().from(staff).where(eq(staff.isActive, 1));
}

export async function createStaff(data: {
  staffNo: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  dateOfJoining?: Date;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  const [result] = await db.insert(staff).values({
    ...data,
    isActive: 1,
  });
  
  return { id: Number(result.insertId), ...data };
}

export async function updateStaff(id: number, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  dateOfJoining?: Date;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(staff).set(data).where(eq(staff.id, id));
  return { success: true };
}

export async function deleteStaff(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  
  await db.update(staff).set({ isActive: 0 }).where(eq(staff.id, id));
  return { success: true };
}

// ============================================
// STUDENT MANAGEMENT HELPERS
// ============================================

import {
  students,
  studentParents,
  studentDocuments,
  admApplications,
  feeInvoices,
  feeInvoiceItems,
} from "../drizzle/schema";

// Get all students with filters
export async function getStudents(filters?: {
  classId?: number;
  sectionId?: number;
  academicYearId?: number;
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) {
    let result = [...MOCK_STUDENTS];
    if (filters?.classId) result = result.filter(s => s.classId === filters.classId);
    if (filters?.status) result = result.filter(s => s.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.studentNo.toLowerCase().includes(q));
    }
    return result;
  }

  let query = db.select().from(students);

  if (filters?.classId) {
    query = query.where(eq(students.classId, filters.classId)) as any;
  }
  if (filters?.sectionId) {
    query = query.where(eq(students.sectionId, filters.sectionId)) as any;
  }
  if (filters?.academicYearId) {
    query = query.where(eq(students.academicYearId, filters.academicYearId)) as any;
  }
  if (filters?.status) {
    query = query.where(eq(students.status, filters.status)) as any;
  }

  const results = await query;

  // Filter by search term if provided
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return results.filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchLower) ||
        s.lastName.toLowerCase().includes(searchLower) ||
        s.studentNo.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

// Get student by ID with full details
export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) {
    const student = MOCK_STUDENTS.find(s => s.id === id);
    return student ? { ...student, parents: [], documents: [] } : null;
  }

  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return null;

  const parents = await db.select().from(studentParents).where(eq(studentParents.studentId, id));
  const documents = await db.select().from(studentDocuments).where(eq(studentDocuments.studentId, id));

  return {
    ...student,
    parents,
    documents,
  };
}

// Create student from approved application (auto-enrollment)
export async function enrollStudentFromApplication(applicationId: string, data: {
  sectionId?: number;
  rollNo?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  // Get application details
  const [application] = await db
    .select()
    .from(admApplications)
    .where(eq(admApplications.id, applicationId));

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.status !== "APPROVED") {
    throw new Error("Only approved applications can be enrolled");
  }

  // Check if already enrolled
  const existing = await db
    .select()
    .from(students)
    .where(eq(students.applicationId, applicationId));

  if (existing.length > 0) {
    throw new Error("Student already enrolled from this application");
  }

  // Generate student number
  const year = new Date().getFullYear();
  const allStudents = await db.select().from(students);
  const studentNo = `STU-${year}-${String(allStudents.length + 1).padStart(3, "0")}`;

  // Create student
  const [result] = await db.insert(students).values({
    studentNo,
    firstName: application.firstName,
    lastName: application.lastName,
    dateOfBirth: application.dateOfBirth,
    gender: application.gender,
    classId: application.classId,
    sectionId: data.sectionId,
    academicYearId: application.academicYearId,
    rollNo: data.rollNo,
    applicationId: application.id,
    status: "ACTIVE",
  });

  const studentId = Number(result.insertId);

  // Create parent record from application contact
  if (application.contactEmail || application.contactPhone) {
    await db.insert(studentParents).values({
      studentId,
      relationship: "Guardian",
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.contactEmail,
      phone: application.contactPhone || "",
      isPrimary: 1,
    });
  }

  return { id: studentId, studentNo };
}

// Create student manually
export async function createStudent(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  classId: number;
  sectionId?: number;
  academicYearId: number;
  rollNo?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  // Generate student number
  const year = new Date().getFullYear();
  const allStudents = await db.select().from(students);
  const studentNo = `STU-${year}-${String(allStudents.length + 1).padStart(3, "0")}`;

  const [result] = await db.insert(students).values({
    studentNo,
    ...data,
    status: "ACTIVE",
  });

  return { id: Number(result.insertId), studentNo };
}

// Update student
export async function updateStudent(
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    classId?: number;
    sectionId?: number;
    rollNo?: string;
    status?: string;
  }
) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  await db.update(students).set(data).where(eq(students.id, id));
  return { success: true };
}

// Add parent to student
export async function addStudentParent(data: {
  studentId: number;
  relationship: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  occupation?: string;
  isPrimary?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const [result] = await db.insert(studentParents).values(data);
  return { success: true, id: Number(result.insertId) };
}

// Get student analytics
export async function getStudentAnalytics() {
  const db = await getDb();
  if (!db) return getMockStudentAnalytics();

  const allStudents = await db.select().from(students);
  const activeStudents = allStudents.filter((s) => s.status === "ACTIVE");

  // Count by class
  const byClass: Record<number, number> = {};
  activeStudents.forEach((s) => {
    byClass[s.classId] = (byClass[s.classId] || 0) + 1;
  });

  // Count by gender
  const byGender: Record<string, number> = {};
  activeStudents.forEach((s) => {
    byGender[s.gender] = (byGender[s.gender] || 0) + 1;
  });

  // Count by status
  const byStatus: Record<string, number> = {};
  allStudents.forEach((s) => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  return {
    total: allStudents.length,
    active: activeStudents.length,
    inactive: allStudents.filter((s) => s.status !== "ACTIVE").length,
    byClass,
    byGender,
    byStatus,
  };
}

// Get financial analytics
export async function getFinancialAnalytics() {
  const db = await getDb();
  if (!db) return getMockFinancialAnalytics();

  const allInvoices = await db.select().from(feeInvoices);

  const totalBilled = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = allInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalPending = totalBilled - totalCollected;

  const paidCount = allInvoices.filter((i) => i.status === "PAID").length;
  const partiallyPaidCount = allInvoices.filter((i) => i.status === "PARTIALLY_PAID").length;
  const unpaidCount = allInvoices.filter((i) => i.status === "UNPAID").length;

  return {
    totalBilled,
    totalCollected,
    totalPending,
    collectionRate: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
    invoiceCount: allInvoices.length,
    paidCount,
    partiallyPaidCount,
    unpaidCount,
  };
}


// Student document management
export async function addStudentDocument(data: {
  studentId: number;
  documentTypeId: number;
  filePath: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const { studentDocuments } = await import("../drizzle/schema");
  const [result] = await db.insert(studentDocuments).values(data);
  return { success: true, id: Number(result.insertId) };
}

export async function getStudentDocuments(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  const { studentDocuments, documentTypes } = await import("../drizzle/schema");
  return await db
    .select({
      id: studentDocuments.id,
      documentTypeName: documentTypes.name,
      filePath: studentDocuments.filePath,
      uploadedAt: studentDocuments.uploadedAt,
    })
    .from(studentDocuments)
    .leftJoin(documentTypes, eq(studentDocuments.documentTypeId, documentTypes.id))
    .where(eq(studentDocuments.studentId, studentId));
}

export async function deleteStudentDocument(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const { studentDocuments } = await import("../drizzle/schema");
  await db.delete(studentDocuments).where(eq(studentDocuments.id, id));
  return { success: true };
}

// Get student-specific invoices
export async function getStudentInvoices(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  const { feeInvoices } = await import("../drizzle/schema");
  return await db
    .select({
      id: feeInvoices.id,
      invoiceNo: feeInvoices.invoiceNo,
      totalAmount: feeInvoices.totalAmount,
      amountPaid: feeInvoices.amountPaid,
      status: feeInvoices.status,
      issueDate: feeInvoices.issueDate,
      dueDate: feeInvoices.dueDate,
      createdAt: feeInvoices.createdAt,
    })
    .from(feeInvoices)
    .where(eq(feeInvoices.studentId, studentId));
}

// Get student-specific payments
export async function getStudentPayments(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  const { feePayments, feeInvoices } = await import("../drizzle/schema");
  return await db
    .select({
      id: feePayments.id,
      amountPaid: feePayments.amountPaid,
      paymentMode: feePayments.paymentMode,
      paymentDate: feePayments.paymentDate,
      transactionRef: feePayments.transactionRef,
      invoiceNo: feeInvoices.invoiceNo,
    })
    .from(feePayments)
    .leftJoin(feeInvoices, eq(feePayments.invoiceId, feeInvoices.id))
    .where(eq(feePayments.studentId, studentId));
}

// Get student parents
export async function getStudentParents(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  const { studentParents } = await import("../drizzle/schema");
  return await db
    .select()
    .from(studentParents)
    .where(eq(studentParents.studentId, studentId));
}

// Generate invoice for a specific student
export async function generateStudentInvoice(data: {
  studentId: number;
  feeStructureId: number;
  dueDate: Date;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const { feeInvoices, feeStructures, feeStructureComponents, feeInvoiceItems } = await import("../drizzle/schema");

  // Get fee structure details
  const [structure] = await db
    .select()
    .from(feeStructures)
    .where(eq(feeStructures.id, data.feeStructureId))
    .limit(1);

  if (!structure) throw new Error("Fee structure not found");

  // Get components
  const components = await db
    .select()
    .from(feeStructureComponents)
    .where(eq(feeStructureComponents.feeStructureId, data.feeStructureId));

  const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);

  // Generate invoice number
  const year = new Date().getFullYear();
  const allInvoices = await db.select().from(feeInvoices);
  const invoiceNo = `INV-${year}-${String(allInvoices.length + 1).padStart(4, "0")}`;

  // Create invoice
  const [invoiceResult] = await db.insert(feeInvoices).values({
    invoiceNo,
    studentId: data.studentId,
    issueDate: new Date(),
    dueDate: data.dueDate,
    totalAmount,
    amountPaid: 0,
    status: "UNPAID",
  });

  const invoiceId = Number(invoiceResult.insertId);

  // Create invoice items
  for (const component of components) {
    await db.insert(feeInvoiceItems).values({
      invoiceId,
      feeHeadId: component.feeHeadId,
      amount: component.amount,
    });
  }

  return { id: invoiceId, invoiceNo, totalAmount };
}


// ==================== Staff Salary & Payment Management ====================

export async function createStaffSalary(data: {
  staffId: number;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  effectiveFrom: Date;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const [result] = await db.insert(staffSalaries).values({
    staffId: data.staffId,
    basicSalary: data.basicSalary,
    allowances: data.allowances || 0,
    deductions: data.deductions || 0,
    effectiveFrom: data.effectiveFrom,
  });

  return { success: true, id: Number(result.insertId) };
}

export async function getStaffCurrentSalary(staffId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(staffSalaries)
    .where(eq(staffSalaries.staffId, staffId))
    .orderBy(desc(staffSalaries.effectiveFrom))
    .limit(1);

  return result[0] || null;
}

export async function getStaffSalaryHistory(staffId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(staffSalaries)
    .where(eq(staffSalaries.staffId, staffId))
    .orderBy(desc(staffSalaries.effectiveFrom));
}

export async function recordStaffPayment(data: {
  staffId: number;
  paymentDate: Date;
  month: number;
  year: number;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const [result] = await db.insert(staffPayments).values({
    staffId: data.staffId,
    paymentDate: data.paymentDate,
    month: data.month,
    year: data.year,
    amount: data.amount,
    paymentMode: data.paymentMode,
    referenceNo: data.referenceNo,
    status: "PAID",
    createdBy: data.createdBy,
  });

  return { success: true, id: Number(result.insertId) };
}

export async function getStaffPayments(staffId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(staffPayments)
    .where(eq(staffPayments.staffId, staffId))
    .orderBy(desc(staffPayments.paymentDate));
}

export async function getStaffPaymentsByPeriod(month: number, year: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: staffPayments.id,
      staffId: staffPayments.staffId,
      staffNo: staff.staffNo,
      firstName: staff.firstName,
      lastName: staff.lastName,
      department: staff.department,
      month: staffPayments.month,
      year: staffPayments.year,
      amount: staffPayments.amount,
      paymentDate: staffPayments.paymentDate,
      paymentMode: staffPayments.paymentMode,
      referenceNo: staffPayments.referenceNo,
      status: staffPayments.status,
    })
    .from(staffPayments)
    .leftJoin(staff, eq(staffPayments.staffId, staff.id))
    .where(and(eq(staffPayments.month, month), eq(staffPayments.year, year)))
    .orderBy(desc(staffPayments.paymentDate));
}

export async function getAllStaffWithSalary() {
  const db = await getDb();
  if (!db) return MOCK_STAFF.map(s => ({ ...s, currentSalary: 45000, basicSalary: 40000, allowances: 8000, deductions: 3000 }));

  // Get all staff with their current salary
  const allStaff = await db.select().from(staff).where(eq(staff.isActive, 1));

  const staffWithSalary = await Promise.all(
    allStaff.map(async (s) => {
      const currentSalary = await getStaffCurrentSalary(s.id);
      return {
        ...s,
        currentSalary: currentSalary
          ? currentSalary.basicSalary + currentSalary.allowances - currentSalary.deductions
          : 0,
        basicSalary: currentSalary?.basicSalary || 0,
        allowances: currentSalary?.allowances || 0,
        deductions: currentSalary?.deductions || 0,
      };
    })
  );

  return staffWithSalary;
}


// ==================== Leave Management ====================

export async function createLeaveType(data: {
  name: string;
  maxDaysPerYear: number;
  isPaid: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const [result] = await db.insert(leaveTypes).values(data);
  return { success: true, id: Number(result.insertId) };
}

export async function getAllLeaveTypes() {
  const db = await getDb();
  if (!db) return MOCK_LEAVE_TYPES;

  return db.select().from(leaveTypes);
}

export async function applyLeave(data: {
  staffId: number;
  leaveTypeId: number;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const [result] = await db.insert(staffLeaves).values({
    ...data,
    status: "PENDING",
  });

  return { success: true, id: Number(result.insertId) };
}

export async function getStaffLeaves(staffId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: staffLeaves.id,
      staffId: staffLeaves.staffId,
      leaveTypeId: staffLeaves.leaveTypeId,
      leaveTypeName: leaveTypes.name,
      isPaid: leaveTypes.isPaid,
      startDate: staffLeaves.startDate,
      endDate: staffLeaves.endDate,
      days: staffLeaves.days,
      reason: staffLeaves.reason,
      status: staffLeaves.status,
      approvedBy: staffLeaves.approvedBy,
      approvedAt: staffLeaves.approvedAt,
      createdAt: staffLeaves.createdAt,
    })
    .from(staffLeaves)
    .leftJoin(leaveTypes, eq(staffLeaves.leaveTypeId, leaveTypes.id))
    .where(eq(staffLeaves.staffId, staffId))
    .orderBy(desc(staffLeaves.createdAt));
}

export async function getPendingLeaves() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: staffLeaves.id,
      staffId: staffLeaves.staffId,
      staffNo: staff.staffNo,
      staffName: sql<string>`CONCAT(${staff.firstName}, ' ', ${staff.lastName})`,
      department: staff.department,
      leaveTypeName: leaveTypes.name,
      startDate: staffLeaves.startDate,
      endDate: staffLeaves.endDate,
      days: staffLeaves.days,
      reason: staffLeaves.reason,
      status: staffLeaves.status,
      createdAt: staffLeaves.createdAt,
    })
    .from(staffLeaves)
    .leftJoin(staff, eq(staffLeaves.staffId, staff.id))
    .leftJoin(leaveTypes, eq(staffLeaves.leaveTypeId, leaveTypes.id))
    .where(eq(staffLeaves.status, "PENDING"))
    .orderBy(desc(staffLeaves.createdAt));
}

export async function approveLeave(leaveId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  await db
    .update(staffLeaves)
    .set({
      status: "APPROVED",
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(staffLeaves.id, leaveId));

  return { success: true };
}

export async function rejectLeave(leaveId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  await db
    .update(staffLeaves)
    .set({
      status: "REJECTED",
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(staffLeaves.id, leaveId));

  return { success: true };
}

export async function getStaffLeaveBalance(staffId: number, leaveTypeId: number) {
  const db = await getDb();
  if (!db) return { maxDays: 0, usedDays: 0, remainingDays: 0 };

  // Get leave type max days
  const leaveType = await db
    .select()
    .from(leaveTypes)
    .where(eq(leaveTypes.id, leaveTypeId))
    .limit(1);

  if (!leaveType[0]) return { maxDays: 0, usedDays: 0, remainingDays: 0 };

  const maxDays = leaveType[0].maxDaysPerYear;

  // Calculate used days for current year
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);

  const approvedLeaves = await db
    .select()
    .from(staffLeaves)
    .where(
      and(
        eq(staffLeaves.staffId, staffId),
        eq(staffLeaves.leaveTypeId, leaveTypeId),
        eq(staffLeaves.status, "APPROVED"),
        sql`${staffLeaves.startDate} >= ${yearStart}`,
        sql`${staffLeaves.endDate} <= ${yearEnd}`
      )
    );

  const usedDays = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

  return {
    maxDays,
    usedDays,
    remainingDays: maxDays - usedDays,
  };
}

// Exam Management Queries
export async function getExamTypes() {
  const db = await getDb();
  if (!db) return MOCK_EXAM_TYPES;
  const { examTypes } = await import("../drizzle/schema");
  return db.select().from(examTypes).where(eq(examTypes.isActive, 1));
}

export async function createExamType(data: {
  name: string;
  description?: string;
  weightage: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { examTypes } = await import("../drizzle/schema");
  const [result] = await db.insert(examTypes).values(data);
  return { id: Number(result.insertId) };
}

export async function updateExamType(id: number, data: {
  name?: string;
  description?: string;
  weightage?: number;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { examTypes } = await import("../drizzle/schema");
  await db.update(examTypes).set(data).where(eq(examTypes.id, id));
  return { success: true };
}

export async function createExam(data: {
  name: string;
  examTypeId: number;
  academicYearId: number;
  classId: number;
  startDate: Date;
  endDate: Date;
  totalMarks: number;
  passingMarks: number;
  subjects: Array<{
    subjectId: number;
    maxMarks: number;
    passingMarks: number;
    examDate: Date;
  }>;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { exams, examSubjects } = await import("../drizzle/schema");

  const [result] = await db.insert(exams).values({
    name: data.name,
    examTypeId: data.examTypeId,
    academicYearId: data.academicYearId,
    classId: data.classId,
    startDate: data.startDate,
    endDate: data.endDate,
    totalMarks: data.totalMarks,
    passingMarks: data.passingMarks,
  });

  const examId = Number(result.insertId);

  if (data.subjects && data.subjects.length > 0) {
    await db.insert(examSubjects).values(
      data.subjects.map(s => ({
        examId,
        subjectId: s.subjectId,
        maxMarks: s.maxMarks,
        passingMarks: s.passingMarks,
        examDate: s.examDate,
      }))
    );
  }

  return { id: examId };
}

export async function getExams(filters?: {
  academicYearId?: number;
  classId?: number;
  examTypeId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  const { exams, examTypes, academicYears, classes } = await import("../drizzle/schema");

  let query = db
    .select({
      id: exams.id,
      name: exams.name,
      examTypeName: examTypes.name,
      academicYear: academicYears.name,
      className: classes.name,
      startDate: exams.startDate,
      endDate: exams.endDate,
      totalMarks: exams.totalMarks,
      passingMarks: exams.passingMarks,
      status: exams.status,
    })
    .from(exams)
    .leftJoin(examTypes, eq(exams.examTypeId, examTypes.id))
    .leftJoin(academicYears, eq(exams.academicYearId, academicYears.id))
    .leftJoin(classes, eq(exams.classId, classes.id));

  if (filters?.academicYearId) {
    query = query.where(eq(exams.academicYearId, filters.academicYearId)) as any;
  }
  if (filters?.classId) {
    query = query.where(eq(exams.classId, filters.classId)) as any;
  }
  if (filters?.examTypeId) {
    query = query.where(eq(exams.examTypeId, filters.examTypeId)) as any;
  }
  if (filters?.status) {
    query = query.where(eq(exams.status, filters.status)) as any;
  }

  return query;
}

export async function getExamById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { exams, examTypes, academicYears, classes, examSubjects, subjects } = await import("../drizzle/schema");

  const [exam] = await db
    .select({
      id: exams.id,
      name: exams.name,
      examTypeId: exams.examTypeId,
      examTypeName: examTypes.name,
      academicYearId: exams.academicYearId,
      academicYear: academicYears.name,
      classId: exams.classId,
      className: classes.name,
      startDate: exams.startDate,
      endDate: exams.endDate,
      totalMarks: exams.totalMarks,
      passingMarks: exams.passingMarks,
      status: exams.status,
    })
    .from(exams)
    .leftJoin(examTypes, eq(exams.examTypeId, examTypes.id))
    .leftJoin(academicYears, eq(exams.academicYearId, academicYears.id))
    .leftJoin(classes, eq(exams.classId, classes.id))
    .where(eq(exams.id, id))
    .limit(1);

  if (!exam) return null;

  const examSubjectsData = await db
    .select({
      id: examSubjects.id,
      subjectId: examSubjects.subjectId,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      maxMarks: examSubjects.maxMarks,
      passingMarks: examSubjects.passingMarks,
      examDate: examSubjects.examDate,
    })
    .from(examSubjects)
    .leftJoin(subjects, eq(examSubjects.subjectId, subjects.id))
    .where(eq(examSubjects.examId, id));

  return { ...exam, subjects: examSubjectsData };
}

export async function updateExamStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { exams } = await import("../drizzle/schema");
  await db.update(exams).set({ status }).where(eq(exams.id, id));
  return { success: true };
}

export async function enterMarks(data: {
  studentId: number;
  examSubjectId: number;
  marksObtained: number;
  isAbsent?: number;
  remarks?: string;
  enteredBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { studentMarks } = await import("../drizzle/schema");

  // Check if marks already exist
  const [existing] = await db
    .select()
    .from(studentMarks)
    .where(
      and(
        eq(studentMarks.studentId, data.studentId),
        eq(studentMarks.examSubjectId, data.examSubjectId)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing marks
    await db
      .update(studentMarks)
      .set({
        marksObtained: data.marksObtained,
        isAbsent: data.isAbsent || 0,
        remarks: data.remarks,
        updatedAt: new Date(),
      })
      .where(eq(studentMarks.id, existing.id));
    return { id: existing.id, updated: true };
  } else {
    // Insert new marks
    const [result] = await db.insert(studentMarks).values({
      studentId: data.studentId,
      examSubjectId: data.examSubjectId,
      marksObtained: data.marksObtained,
      isAbsent: data.isAbsent || 0,
      remarks: data.remarks,
      enteredBy: data.enteredBy,
    });
    return { id: Number(result.insertId), updated: false };
  }
}

export async function bulkEnterMarks(marks: Array<{
  studentId: number;
  examSubjectId: number;
  marksObtained: number;
  isAbsent?: number;
  remarks?: string;
  enteredBy: number;
}>) {
  const db = await getDb();
  if (!db) return { success: true } as any;

  const results = [];
  for (const mark of marks) {
    const result = await enterMarks(mark);
    results.push(result);
  }

  return { count: results.length, results };
}

export async function getStudentMarks(studentId: number, filters?: {
  examId?: number;
  academicYearId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { studentMarks, examSubjects, exams, subjects, examTypes } = await import("../drizzle/schema");

  const conditions = [eq(studentMarks.studentId, studentId)];
  if (filters?.examId) {
    conditions.push(eq(exams.id, filters.examId));
  }
  if (filters?.academicYearId) {
    conditions.push(eq(exams.academicYearId, filters.academicYearId));
  }

  return db
    .select({
      id: studentMarks.id,
      examId: exams.id,
      examName: exams.name,
      examTypeName: examTypes.name,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      maxMarks: examSubjects.maxMarks,
      marksObtained: studentMarks.marksObtained,
      isAbsent: studentMarks.isAbsent,
      remarks: studentMarks.remarks,
      examDate: examSubjects.examDate,
    })
    .from(studentMarks)
    .leftJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .leftJoin(exams, eq(examSubjects.examId, exams.id))
    .leftJoin(subjects, eq(examSubjects.subjectId, subjects.id))
    .leftJoin(examTypes, eq(exams.examTypeId, examTypes.id))
    .where(and(...conditions));
}

export async function getExamMarks(examId: number, subjectId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { studentMarks, examSubjects, students, subjects } = await import("../drizzle/schema");

  const conditions = [eq(examSubjects.examId, examId)];
  if (subjectId) {
    conditions.push(eq(examSubjects.subjectId, subjectId));
  }

  return db
    .select({
      id: studentMarks.id,
      studentId: students.id,
      studentNo: students.studentNo,
      studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
      subjectId: subjects.id,
      subjectName: subjects.name,
      maxMarks: examSubjects.maxMarks,
      marksObtained: studentMarks.marksObtained,
      isAbsent: studentMarks.isAbsent,
      remarks: studentMarks.remarks,
    })
    .from(studentMarks)
    .leftJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .leftJoin(students, eq(studentMarks.studentId, students.id))
    .leftJoin(subjects, eq(examSubjects.subjectId, subjects.id))
    .where(and(...conditions));
}

export async function getPerformanceAnalytics(filters: {
  academicYearId?: number;
  classId?: number;
  examId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const { studentMarks, examSubjects, exams, students } = await import("../drizzle/schema");

  // Get overall statistics
  let query = db
    .select({
      totalStudents: sql<number>`COUNT(DISTINCT ${students.id})`,
      totalExams: sql<number>`COUNT(DISTINCT ${exams.id})`,
      averageMarks: sql<number>`AVG(${studentMarks.marksObtained})`,
      totalAbsent: sql<number>`SUM(${studentMarks.isAbsent})`,
    })
    .from(studentMarks)
    .leftJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .leftJoin(exams, eq(examSubjects.examId, exams.id))
    .leftJoin(students, eq(studentMarks.studentId, students.id));

  if (filters.academicYearId) {
    query = query.where(eq(exams.academicYearId, filters.academicYearId)) as any;
  }
  if (filters.classId) {
    query = query.where(eq(exams.classId, filters.classId)) as any;
  }
  if (filters.examId) {
    query = query.where(eq(exams.id, filters.examId)) as any;
  }

  const [stats] = await query;
  return stats;
}

export async function getSubjectWisePerformance(filters: {
  academicYearId?: number;
  classId?: number;
  examId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { studentMarks, examSubjects, exams, subjects } = await import("../drizzle/schema");

  let query = db
    .select({
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      totalStudents: sql<number>`COUNT(DISTINCT ${studentMarks.studentId})`,
      averageMarks: sql<number>`AVG(${studentMarks.marksObtained})`,
      maxMarksObtained: sql<number>`MAX(${studentMarks.marksObtained})`,
      minMarksObtained: sql<number>`MIN(${studentMarks.marksObtained})`,
      totalAbsent: sql<number>`SUM(${studentMarks.isAbsent})`,
    })
    .from(studentMarks)
    .leftJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .leftJoin(exams, eq(examSubjects.examId, exams.id))
    .leftJoin(subjects, eq(examSubjects.subjectId, subjects.id));

  if (filters.academicYearId) {
    query = query.where(eq(exams.academicYearId, filters.academicYearId)) as any;
  }
  if (filters.classId) {
    query = query.where(eq(exams.classId, filters.classId)) as any;
  }
  if (filters?.examId) {
    query = query.where(eq(exams.id, filters.examId)) as any;
  }

  query = query.groupBy(subjects.id, subjects.name, subjects.code) as any;

  return await query;
}

export async function getTopPerformers(filters: {
  academicYearId?: number;
  classId?: number;
  examId?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { studentMarks, examSubjects, exams, students } = await import("../drizzle/schema");

  const conditions = [eq(studentMarks.isAbsent, 0)];
  if (filters.academicYearId) {
    conditions.push(eq(exams.academicYearId, filters.academicYearId));
  }
  if (filters.classId) {
    conditions.push(eq(exams.classId, filters.classId));
  }
  if (filters.examId) {
    conditions.push(eq(exams.id, filters.examId));
  }

  return db
    .select({
      studentId: students.id,
      studentNo: students.studentNo,
      studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
      totalMarks: sql<number>`SUM(${studentMarks.marksObtained})`,
      averageMarks: sql<number>`AVG(${studentMarks.marksObtained})`,
      examCount: sql<number>`COUNT(DISTINCT ${examSubjects.examId})`,
    })
    .from(studentMarks)
    .leftJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .leftJoin(exams, eq(examSubjects.examId, exams.id))
    .leftJoin(students, eq(studentMarks.studentId, students.id))
    .where(and(...conditions))
    .groupBy(students.id, students.studentNo, students.firstName, students.lastName)
    .orderBy(sql`SUM(${studentMarks.marksObtained}) DESC`)
    .limit(filters.limit || 10);
}


// ============================================
// Grade Scale Management
// ============================================

export async function createGradeScale(data: {
  gradeName: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoints: number;
  description?: string;
  displayOrder: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { gradeScales } = await import("../drizzle/schema");
  const [result] = await db.insert(gradeScales).values(data);
  return { id: Number(result.insertId) };
}

export async function getGradeScales() {
  const db = await getDb();
  if (!db) return MOCK_GRADE_SCALES;
  const { gradeScales } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  return db
    .select()
    .from(gradeScales)
    .where(eq(gradeScales.isActive, 1))
    .orderBy(gradeScales.displayOrder);
}

export async function updateGradeScale(id: number, data: {
  gradeName?: string;
  minPercentage?: number;
  maxPercentage?: number;
  gradePoints?: number;
  description?: string;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { gradeScales } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(gradeScales).set(data).where(eq(gradeScales.id, id));
  return { success: true };
}

export async function deleteGradeScale(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { gradeScales } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(gradeScales).set({ isActive: 0 }).where(eq(gradeScales.id, id));
  return { success: true };
}

export async function calculateGrade(percentage: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const { gradeScales } = await import("../drizzle/schema");
  const { and, gte, lte, eq } = await import("drizzle-orm");
  
  const [grade] = await db
    .select()
    .from(gradeScales)
    .where(
      and(
        gte(gradeScales.maxPercentage, percentage),
        lte(gradeScales.minPercentage, percentage),
        eq(gradeScales.isActive, 1)
      )
    )
    .limit(1);
  
  return grade?.gradeName || null;
}

// ============================================
// Report Card Management
// ============================================

export async function generateReportCard(data: {
  studentId: number;
  examId: number;
  generatedBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { reportCards, studentMarks, examSubjects, students, exams } = await import("../drizzle/schema");
  const { eq, and, sql } = await import("drizzle-orm");

  // Get exam details
  const [exam] = await db.select().from(exams).where(eq(exams.id, data.examId)).limit(1);
  if (!exam) throw new Error("Exam not found");

  // Get student marks for this exam
  const marks = await db
    .select({
      marksObtained: studentMarks.marksObtained,
      maxMarks: examSubjects.maxMarks,
      isAbsent: studentMarks.isAbsent,
      grade: studentMarks.grade,
    })
    .from(studentMarks)
    .innerJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .where(
      and(
        eq(studentMarks.studentId, data.studentId),
        eq(examSubjects.examId, data.examId)
      )
    );

  if (marks.length === 0) {
    return null; // Return null instead of throwing error
  }

  // Calculate totals
  const totalMarks = marks.reduce((sum, m) => sum + m.maxMarks, 0);
  const marksObtained = marks.reduce((sum, m) => (m.isAbsent ? sum : sum + m.marksObtained), 0);
  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

  // Calculate overall grade
  const overallGrade = await calculateGrade(percentage);

  // Calculate rank (count students with higher percentage)
  const rankQuery = await db
    .select({ count: sql<number>`count(distinct ${studentMarks.studentId})` })
    .from(studentMarks)
    .innerJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .where(eq(examSubjects.examId, data.examId))
    .groupBy(studentMarks.studentId)
    .having(sql`sum(${studentMarks.marksObtained}) > ${marksObtained}`);

  const rank = (rankQuery[0]?.count || 0) + 1;

  // Check if report card already exists
  const [existing] = await db
    .select()
    .from(reportCards)
    .where(
      and(
        eq(reportCards.studentId, data.studentId),
        eq(reportCards.examId, data.examId)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing report card
    await db
      .update(reportCards)
      .set({
        totalMarks,
        marksObtained,
        percentage,
        overallGrade,
        rank,
        updatedAt: new Date(),
      })
      .where(eq(reportCards.id, existing.id));
    return { id: existing.id, updated: true };
  } else {
    // Create new report card
    const [result] = await db.insert(reportCards).values({
      studentId: data.studentId,
      examId: data.examId,
      totalMarks,
      marksObtained,
      percentage,
      overallGrade,
      rank,
      generatedBy: data.generatedBy,
    });
    return { id: Number(result.insertId), updated: false };
  }
}

export async function getReportCard(studentId: number, examId: number) {
  const db = await getDb();
  if (!db) return null;
  const { reportCards, students, exams, studentMarks, examSubjects, subjects } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  // Get report card
  const [reportCard] = await db
    .select({
      id: reportCards.id,
      totalMarks: reportCards.totalMarks,
      marksObtained: reportCards.marksObtained,
      percentage: reportCards.percentage,
      overallGrade: reportCards.overallGrade,
      rank: reportCards.rank,
      remarks: reportCards.remarks,
      generatedAt: reportCards.generatedAt,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
      studentId: students.id,
      studentNo: students.studentNo,
      className: sql<string>`(select name from classes where id = ${students.classId})`,
      examName: exams.name,
      examDate: exams.startDate,
      academicYear: sql<string>`(select name from academic_years where id = ${exams.academicYearId})`,
    })
    .from(reportCards)
    .innerJoin(students, eq(reportCards.studentId, students.id))
    .innerJoin(exams, eq(reportCards.examId, exams.id))
    .where(
      and(
        eq(reportCards.studentId, studentId),
        eq(reportCards.examId, examId)
      )
    )
    .limit(1);

  if (!reportCard) return null;

  // Get subject-wise marks
  const subjectMarks = await db
    .select({
      subjectName: subjects.name,
      subjectCode: subjects.code,
      maxMarks: examSubjects.maxMarks,
      passingMarks: examSubjects.passingMarks,
      marksObtained: studentMarks.marksObtained,
      grade: studentMarks.grade,
      isAbsent: studentMarks.isAbsent,
      remarks: studentMarks.remarks,
    })
    .from(studentMarks)
    .innerJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .innerJoin(subjects, eq(examSubjects.subjectId, subjects.id))
    .where(
      and(
        eq(studentMarks.studentId, studentId),
        eq(examSubjects.examId, examId)
      )
    );

  return {
    ...reportCard,
    subjects: subjectMarks,
  };
}

export async function getStudentReportCards(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { reportCards, exams } = await import("../drizzle/schema");
  const { eq, sql } = await import("drizzle-orm");

  return db
    .select({
      id: reportCards.id,
      examId: reportCards.examId,
      examName: exams.name,
      totalMarks: reportCards.totalMarks,
      marksObtained: reportCards.marksObtained,
      percentage: reportCards.percentage,
      overallGrade: reportCards.overallGrade,
      rank: reportCards.rank,
      generatedAt: reportCards.generatedAt,
      academicYear: sql<string>`(select name from academic_years where id = ${exams.academicYearId})`,
    })
    .from(reportCards)
    .innerJoin(exams, eq(reportCards.examId, exams.id))
    .where(eq(reportCards.studentId, studentId))
    .orderBy(reportCards.generatedAt);
}

export async function bulkGenerateReportCards(data: {
  examId: number;
  studentIds: number[];
  generatedBy: number;
}) {
  const results = [];
  for (const studentId of data.studentIds) {
    try {
      const result = await generateReportCard({
        studentId,
        examId: data.examId,
        generatedBy: data.generatedBy,
      });
      if (result) {
        results.push({ studentId, success: true, reportCardId: result.id });
      } else {
        results.push({ studentId, success: false, error: "No marks found for this student" });
      }
    } catch (error) {
      results.push({ studentId, success: false, error: (error as Error).message });
    }
  }
  return results;
}


// ============================================
// Communication System
// ============================================

export async function createMessageTemplate(data: {
  name: string;
  category: "attendance" | "fees" | "marks" | "general" | "festival";
  channel: "sms" | "whatsapp" | "both";
  subject?: string;
  content: string;
  variables?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { messageTemplates } = await import("../drizzle/schema");
  const [result] = await db.insert(messageTemplates).values(data);
  return { id: Number(result.insertId) };
}

export async function getMessageTemplates(filters?: {
  category?: string;
  channel?: string;
}) {
  const db = await getDb();
  if (!db) return MOCK_MESSAGE_TEMPLATES;
  const { messageTemplates } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  const conditions = [eq(messageTemplates.isActive, 1)];
  
  if (filters?.category) {
    conditions.push(eq(messageTemplates.category, filters.category as any));
  }
  
  if (filters?.channel) {
    conditions.push(eq(messageTemplates.channel, filters.channel as any));
  }
  
  return db.select().from(messageTemplates).where(and(...conditions));
}

export async function getMessageTemplate(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { messageTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const [template] = await db.select().from(messageTemplates).where(eq(messageTemplates.id, id)).limit(1);
  return template || null;
}

export async function updateMessageTemplate(id: number, data: {
  name?: string;
  category?: "attendance" | "fees" | "marks" | "general" | "festival";
  channel?: "sms" | "whatsapp" | "both";
  subject?: string;
  content?: string;
  variables?: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { messageTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(messageTemplates).set(data).where(eq(messageTemplates.id, id));
  return { success: true };
}

export async function deleteMessageTemplate(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { messageTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(messageTemplates).set({ isActive: 0 }).where(eq(messageTemplates.id, id));
  return { success: true };
}

export async function createMessage(data: {
  recipientType: "parent" | "student" | "staff" | "all_parents";
  recipientId?: number;
  recipientPhone: string;
  recipientName?: string;
  channel: "sms" | "whatsapp";
  templateId?: number;
  subject?: string;
  content: string;
  sentBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { messages } = await import("../drizzle/schema");
  const [result] = await db.insert(messages).values(data);
  return { id: Number(result.insertId) };
}

export async function updateMessageStatus(id: number, data: {
  status: "pending" | "sent" | "failed" | "delivered";
  deliveryStatus?: string;
  sentAt?: Date;
  deliveredAt?: Date;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { messages } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(messages).set(data).where(eq(messages.id, id));
  return { success: true };
}

export async function getMessages(filters?: {
  recipientType?: string;
  recipientId?: number;
  channel?: string;
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { messages } = await import("../drizzle/schema");
  const { eq, and, desc } = await import("drizzle-orm");
  
  const conditions = [];
  
  if (filters?.recipientType) {
    conditions.push(eq(messages.recipientType, filters.recipientType as any));
  }
  
  if (filters?.recipientId) {
    conditions.push(eq(messages.recipientId, filters.recipientId));
  }
  
  if (filters?.channel) {
    conditions.push(eq(messages.channel, filters.channel as any));
  }
  
  if (filters?.status) {
    conditions.push(eq(messages.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    return db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(filters?.limit || 100);
  }
  
  return db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(filters?.limit || 100);
}

export async function createScheduledMessage(data: {
  name: string;
  templateId: number;
  recipientType: "all_parents" | "all_students" | "all_staff" | "specific_class";
  classId?: number;
  channel: "sms" | "whatsapp" | "both";
  scheduleType: "once" | "daily" | "weekly" | "monthly" | "yearly";
  scheduleDate?: Date;
  scheduleTime?: string;
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  scheduleMonthDay?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { scheduledMessages } = await import("../drizzle/schema");
  
  // Calculate next run time
  const nextRun = calculateNextRun(data);
  
  const [result] = await db.insert(scheduledMessages).values({
    ...data,
    nextRun,
  });
  return { id: Number(result.insertId) };
}

export async function getScheduledMessages(filters?: {
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  const { scheduledMessages } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  if (filters?.isActive !== undefined) {
    return db
      .select()
      .from(scheduledMessages)
      .where(eq(scheduledMessages.isActive, filters.isActive ? 1 : 0));
  }
  
  return db.select().from(scheduledMessages);
}

export async function updateScheduledMessage(id: number, data: {
  name?: string;
  templateId?: number;
  scheduleType?: "once" | "daily" | "weekly" | "monthly" | "yearly";
  scheduleDate?: Date;
  scheduleTime?: string;
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  scheduleMonthDay?: string;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { scheduledMessages } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(scheduledMessages).set(data).where(eq(scheduledMessages.id, id));
  return { success: true };
}

export async function deleteScheduledMessage(id: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { scheduledMessages } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(scheduledMessages).set({ isActive: 0 }).where(eq(scheduledMessages.id, id));
  return { success: true };
}

function calculateNextRun(schedule: {
  scheduleType: "once" | "daily" | "weekly" | "monthly" | "yearly";
  scheduleDate?: Date;
  scheduleTime?: string;
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  scheduleMonthDay?: string;
}): Date {
  const now = new Date();
  
  if (schedule.scheduleType === "once" && schedule.scheduleDate) {
    return schedule.scheduleDate;
  }
  
  if (schedule.scheduleType === "daily" && schedule.scheduleTime) {
    const [hours, minutes] = schedule.scheduleTime.split(":").map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }
  
  // For other types, return tomorrow at the same time for now
  // TODO: Implement proper scheduling logic for weekly, monthly, yearly
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  return next;
}

export async function getParentPhoneNumbers(studentId?: number): Promise<Array<{ phone: string; name: string; studentName: string }>> {
  const db = await getDb();
  if (!db) return [];
  const { studentParents, students } = await import("../drizzle/schema");
  const { eq, sql, and } = await import("drizzle-orm");
  
  const conditions = [
    sql`${studentParents.phone} is not null`,
    sql`${studentParents.phone} != ''`,
  ];
  
  if (studentId) {
    conditions.push(eq(studentParents.studentId, studentId));
  }
  
  const parents = await db
    .select({
      phone: studentParents.phone,
      name: sql<string>`concat(${studentParents.firstName}, ' ', ${studentParents.lastName}, ' (', ${studentParents.relationship}, ')')`,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
    })
    .from(studentParents)
    .innerJoin(students, eq(studentParents.studentId, students.id))
    .where(and(...conditions));
  
  return parents;
}



// ============================================================================
// Attendance Management
// ============================================================================

export async function markAttendance(data: {
  studentId: number;
  date: Date;
  status: "present" | "absent" | "late" | "half_day";
  remarks?: string;
  markedBy: number;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { attendance } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  // Check if attendance already exists for this student and date
  const existing = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, data.studentId),
        eq(attendance.date, data.date)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing attendance
    await db
      .update(attendance)
      .set({
        status: data.status,
        remarks: data.remarks,
        markedBy: data.markedBy,
        updatedAt: new Date(),
      })
      .where(eq(attendance.id, existing[0].id));
    
    return existing[0].id;
  } else {
    // Insert new attendance record
    const result = await db.insert(attendance).values(data);
    return result[0].insertId;
  }
}

export async function getAttendance(filters: {
  studentId?: number;
  classId?: number;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  status?: "present" | "absent" | "late" | "half_day";
}) {
  const db = await getDb();
  if (!db) return [];
  const { attendance, students } = await import("../drizzle/schema");
  const { eq, and, gte, lte, sql } = await import("drizzle-orm");
  
  const conditions = [];
  
  if (filters.studentId) {
    conditions.push(eq(attendance.studentId, filters.studentId));
  }
  
  if (filters.classId) {
    conditions.push(eq(students.classId, filters.classId));
  }
  
  if (filters.date) {
    conditions.push(eq(attendance.date, filters.date));
  }
  
  if (filters.startDate) {
    conditions.push(gte(attendance.date, filters.startDate));
  }
  
  if (filters.endDate) {
    conditions.push(lte(attendance.date, filters.endDate));
  }
  
  if (filters.status) {
    conditions.push(eq(attendance.status, filters.status));
  }
  
  const query = db
    .select({
      id: attendance.id,
      studentId: attendance.studentId,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      markedBy: attendance.markedBy,
      createdAt: attendance.createdAt,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id));
  
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function getAttendanceStats(studentId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { total: 0, present: 0, absent: 0, late: 0, halfDay: 0, percentage: 0 };
  const { attendance } = await import("../drizzle/schema");
  const { eq, and, gte, lte, sql } = await import("drizzle-orm");
  
  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      present: sql<number>`sum(case when ${attendance.status} = 'present' then 1 else 0 end)`,
      absent: sql<number>`sum(case when ${attendance.status} = 'absent' then 1 else 0 end)`,
      late: sql<number>`sum(case when ${attendance.status} = 'late' then 1 else 0 end)`,
      halfDay: sql<number>`sum(case when ${attendance.status} = 'half_day' then 1 else 0 end)`,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, studentId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate)
      )
    );
  
  const result = stats[0];
  const total = Number(result.total) || 0;
  const present = Number(result.present) || 0;
  const late = Number(result.late) || 0;
  const halfDay = Number(result.halfDay) || 0;
  
  // Calculate percentage (present + late + half_day count as attended)
  const attended = present + late + halfDay;
  const percentage = total > 0 ? (attended / total) * 100 : 0;
  
  return {
    total,
    present,
    absent: Number(result.absent) || 0,
    late,
    halfDay,
    percentage: Math.round(percentage * 100) / 100,
  };
}

// ============================================================================
// Leave Applications
// ============================================================================

export async function createLeaveApplication(data: {
  studentId: number;
  parentId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { leaveApplications } = await import("../drizzle/schema");
  
  const result = await db.insert(leaveApplications).values(data);
  return { id: result[0].insertId };
}

export async function getLeaveApplications(filters: {
  studentId?: number;
  parentId?: number;
  status?: "pending" | "approved" | "rejected";
}) {
  const db = await getDb();
  if (!db) return [];
  const { leaveApplications, students, users } = await import("../drizzle/schema");
  const { eq, and, sql } = await import("drizzle-orm");
  
  const conditions = [];
  
  if (filters.studentId) {
    conditions.push(eq(leaveApplications.studentId, filters.studentId));
  }
  
  if (filters.parentId) {
    conditions.push(eq(leaveApplications.parentId, filters.parentId));
  }
  
  if (filters.status) {
    conditions.push(eq(leaveApplications.status, filters.status));
  }
  
  const query = db
    .select({
      id: leaveApplications.id,
      studentId: leaveApplications.studentId,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
      parentId: leaveApplications.parentId,
      parentName: users.name,
      startDate: leaveApplications.startDate,
      endDate: leaveApplications.endDate,
      reason: leaveApplications.reason,
      status: leaveApplications.status,
      reviewedBy: leaveApplications.reviewedBy,
      reviewedAt: leaveApplications.reviewedAt,
      reviewComments: leaveApplications.reviewComments,
      createdAt: leaveApplications.createdAt,
    })
    .from(leaveApplications)
    .innerJoin(students, eq(leaveApplications.studentId, students.id))
    .innerJoin(users, eq(leaveApplications.parentId, users.id));
  
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function updateLeaveApplication(
  id: number,
  data: {
    status?: "pending" | "approved" | "rejected";
    reviewedBy?: number;
    reviewComments?: string;
  }
) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { leaveApplications } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db
    .update(leaveApplications)
    .set({
      ...data,
      reviewedAt: data.status ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(leaveApplications.id, id));
}

// ============================================================================
// Parent Portal Functions
// ============================================================================

// getParentChildren function moved to Parent Registration section below

export async function getChildPerformanceSummary(studentId: number) {
  const db = await getDb();
  if (!db) return null;
  const { students, studentMarks, exams, examSubjects } = await import("../drizzle/schema");
  const { eq, sql, and } = await import("drizzle-orm");
  
  // Get student basic info
  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  
  if (student.length === 0) return null;
  
  // Get latest exam results
  const latestResults = await db
    .select({
      examId: exams.id,
      examName: exams.name,
      startDate: exams.startDate,
      totalMarks: sql<number>`sum(${examSubjects.maxMarks})`,
      obtainedMarks: sql<number>`sum(${studentMarks.marksObtained})`,
      percentage: sql<number>`(sum(${studentMarks.marksObtained}) / sum(${examSubjects.maxMarks})) * 100`,
    })
    .from(studentMarks)
    .innerJoin(examSubjects, eq(studentMarks.examSubjectId, examSubjects.id))
    .innerJoin(exams, eq(examSubjects.examId, exams.id))
    .where(eq(studentMarks.studentId, studentId))
    .groupBy(exams.id, exams.name, exams.startDate)
    .orderBy(sql`${exams.startDate} desc`)
    .limit(5);
  
  return {
    student: student[0],
    recentExams: latestResults,
  };
}

export async function getParentNotifications(parentId: number, filters?: {
  isRead?: boolean;
  category?: "attendance" | "marks" | "fees" | "general" | "announcement";
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { parentNotifications } = await import("../drizzle/schema");
  const { eq, and, desc } = await import("drizzle-orm");
  
  const conditions = [eq(parentNotifications.parentId, parentId)];
  
  if (filters?.isRead !== undefined) {
    conditions.push(eq(parentNotifications.isRead, filters.isRead ? 1 : 0));
  }
  
  if (filters?.category) {
    conditions.push(eq(parentNotifications.category, filters.category));
  }
  
  let query = db
    .select()
    .from(parentNotifications)
    .where(and(...conditions))
    .orderBy(desc(parentNotifications.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { parentNotifications } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db
    .update(parentNotifications)
    .set({ isRead: 1 })
    .where(eq(parentNotifications.id, notificationId));
}

export async function createParentNotification(data: {
  parentId: number;
  studentId?: number;
  title: string;
  content: string;
  category: "attendance" | "marks" | "fees" | "general" | "announcement";
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { parentNotifications } = await import("../drizzle/schema");
  
  const result = await db.insert(parentNotifications).values(data);
  return { id: result[0].insertId };
}

// ============================================================================
// OTP Verification System
// ============================================================================

export async function generateOTP(): Promise<string> {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTPVerification(data: {
  phone: string;
  otp: string;
  purpose: "parent_registration" | "password_reset" | "phone_verification";
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { otpVerifications } = await import("../drizzle/schema");
  
  const result = await db.insert(otpVerifications).values(data);
  return { id: result[0].insertId };
}

export async function verifyOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const { otpVerifications } = await import("../drizzle/schema");
  const { eq, and, gt } = await import("drizzle-orm");
  
  // Find valid OTP
  const validOTPs = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.purpose, purpose as any),
        eq(otpVerifications.isVerified, 0),
        gt(otpVerifications.expiresAt, new Date())
      )
    )
    .limit(1);
  
  if (validOTPs.length === 0) {
    return false;
  }
  
  // Mark OTP as verified
  await db
    .update(otpVerifications)
    .set({ isVerified: 1 })
    .where(eq(otpVerifications.id, validOTPs[0].id));
  
  return true;
}

export async function cleanupExpiredOTPs() {
  const db = await getDb();
  if (!db) return;
  const { otpVerifications } = await import("../drizzle/schema");
  const { lt } = await import("drizzle-orm");
  
  // Delete OTPs older than 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await db
    .delete(otpVerifications)
    .where(lt(otpVerifications.createdAt, yesterday));
}

// ============================================================================
// Parent Registration
// ============================================================================

export async function findParentByStudentRollAndPhone(studentNo: string, phone: string) {
  const db = await getDb();
  if (!db) return null;
  const { students, studentParents } = await import("../drizzle/schema");
  const { eq, and, sql } = await import("drizzle-orm");
  
  // Find student by roll number
  const student = await db
    .select()
    .from(students)
    .where(eq(students.studentNo, studentNo))
    .limit(1);
  
  if (student.length === 0) {
    return null;
  }
  
  // Find parent record with matching phone
  const parent = await db
    .select({
      id: studentParents.id,
      studentId: studentParents.studentId,
      relationship: studentParents.relationship,
      firstName: studentParents.firstName,
      lastName: studentParents.lastName,
      email: studentParents.email,
      phone: studentParents.phone,
      userId: studentParents.userId,
      studentNo: students.studentNo,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
    })
    .from(studentParents)
    .innerJoin(students, eq(studentParents.studentId, students.id))
    .where(
      and(
        eq(studentParents.studentId, student[0].id),
        eq(studentParents.phone, phone)
      )
    )
    .limit(1);
  
  if (parent.length === 0) {
    return null;
  }
  
  return parent[0];
}

export async function linkParentToUser(parentId: number, userId: number) {
  const db = await getDb();
  if (!db) return { success: true } as any;
  const { studentParents } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db
    .update(studentParents)
    .set({ userId })
    .where(eq(studentParents.id, parentId));
}

export async function getParentChildren(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { studentParents, students, classes } = await import("../drizzle/schema");
  const { eq, sql } = await import("drizzle-orm");
  
  // Get all students linked to this parent via student_parents table
  const children = await db
    .select({
      id: students.id,
      studentNo: students.studentNo,
      firstName: students.firstName,
      lastName: students.lastName,
      classId: students.classId,
      className: classes.name,
      dateOfBirth: students.dateOfBirth,
      gender: students.gender,
      bloodGroup: students.bloodGroup,
      relationship: studentParents.relationship,
    })
    .from(studentParents)
    .innerJoin(students, eq(studentParents.studentId, students.id))
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(studentParents.userId, parentId));
  
  return children;
}
