import { int, mysqlTable, text, timestamp, varchar, mysqlEnum, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "principal", "teacher", "accountant", "parent", "student", "super_admin"]).default("parent").notNull(),
  isSuperAdmin: int("is_super_admin", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Multi-Tenant Organization Tables
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  logo: varchar("logo", { length: 500 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#3b82f6"),
  status: mysqlEnum("status", ["active", "suspended", "trial"]).default("trial").notNull(),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("basic"),
  maxStudents: int("max_students", { unsigned: true }).default(500),
  maxStaff: int("max_staff", { unsigned: true }).default(50),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const organizationUsers = mysqlTable("organization_users", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  userId: int("user_id").notNull(),
  role: mysqlEnum("role", ["admin", "principal", "teacher", "accountant", "parent", "student"]).notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationInvitations = mysqlTable("organization_invitations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["admin", "principal", "teacher", "accountant", "parent", "student"]).notNull(),
  token: varchar("token", { length: 100 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;

// Master Data Tables
export const academicYears = mysqlTable("academic_years", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  displayOrder: int("display_order").notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feeHeads = mysqlTable("fee_heads", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentTypes = mysqlTable("document_types", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isRequired: int("is_required", { unsigned: true }).default(0).notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sections = mysqlTable("sections", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  classId: int("class_id").notNull(),
  capacity: int("capacity").default(40),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classSubjects = mysqlTable("class_subjects", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  classId: int("class_id").notNull(),
  subjectId: int("subject_id").notNull(),
  isCompulsory: int("is_compulsory", { unsigned: true }).default(1).notNull(),
});

export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  staffNo: varchar("staff_no", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).notNull(),
  department: varchar("department", { length: 100 }),
  dateOfJoining: timestamp("date_of_joining"),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveTypes = mysqlTable("leave_types", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  maxDaysPerYear: int("max_days_per_year", { unsigned: true }).notNull(),
  isPaid: int("is_paid", { unsigned: true }).default(1).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staffSalaries = mysqlTable("staff_salaries", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  staffId: int("staff_id").notNull(),
  basicSalary: int("basic_salary", { unsigned: true }).notNull(),
  allowances: int("allowances", { unsigned: true }).default(0).notNull(),
  deductions: int("deductions", { unsigned: true }).default(0).notNull(),
  effectiveFrom: timestamp("effective_from").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staffPayments = mysqlTable("staff_payments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  staffId: int("staff_id").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  month: int("month", { unsigned: true }).notNull(),
  year: int("year", { unsigned: true }).notNull(),
  amount: int("amount", { unsigned: true }).notNull(),
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(),
  referenceNo: varchar("reference_no", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("PAID"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const staffLeaves = mysqlTable("staff_leaves", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  staffId: int("staff_id").notNull(),
  leaveTypeId: int("leave_type_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  days: int("days", { unsigned: true }).notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admissions Tables
export const admApplications = mysqlTable("adm_applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  applicationNo: varchar("application_no", { length: 20 }).notNull().unique(),
  academicYearId: int("academic_year_id").notNull(),
  classId: int("class_id").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  contactEmail: varchar("contact_email", { length: 320 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("SUBMITTED"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const admApplicationDocuments = mysqlTable("adm_application_documents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  applicationId: varchar("application_id", { length: 36 }).notNull(),
  documentTypeId: int("document_type_id").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const admApplicationStatusHistory = mysqlTable("adm_application_status_history", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  applicationId: varchar("application_id", { length: 36 }).notNull(),
  oldStatus: varchar("old_status", { length: 20 }),
  newStatus: varchar("new_status", { length: 20 }).notNull(),
  changedBy: int("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  remarks: text("remarks"),
});

// Fees Tables
export const feeStructures = mysqlTable("fee_structures", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  academicYearId: int("academic_year_id").notNull(),
  classId: int("class_id").notNull(),
  totalAmount: int("total_amount", { unsigned: true }).notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feeStructureComponents = mysqlTable("fee_structure_components", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  feeStructureId: int("fee_structure_id").notNull(),
  feeHeadId: int("fee_head_id").notNull(),
  amount: int("amount", { unsigned: true }).notNull(),
});

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentNo: varchar("student_no", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  bloodGroup: varchar("blood_group", { length: 5 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  classId: int("class_id").notNull(),
  sectionId: int("section_id"),
  academicYearId: int("academic_year_id").notNull(),
  rollNo: varchar("roll_no", { length: 20 }),
  applicationId: varchar("application_id", { length: 36 }),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
  admissionDate: timestamp("admission_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const studentParents = mysqlTable("student_parents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  relationship: varchar("relationship", { length: 20 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  occupation: varchar("occupation", { length: 100 }),
  isPrimary: int("is_primary", { unsigned: true }).default(0).notNull(),
  userId: int("user_id"), // Link to users table when parent registers
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentDocuments = mysqlTable("student_documents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  documentTypeId: int("document_type_id").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  targetRole: varchar("target_role", { length: 50 }),
  isRead: int("is_read", { unsigned: true }).default(0).notNull(),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feeInvoices = mysqlTable("fee_invoices", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  invoiceNo: varchar("invoice_no", { length: 20 }).notNull().unique(),
  studentId: int("student_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalAmount: int("total_amount", { unsigned: true }).notNull(),
  amountPaid: int("amount_paid", { unsigned: true }).default(0).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("UNPAID"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feeInvoiceItems = mysqlTable("fee_invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  invoiceId: int("invoice_id").notNull(),
  feeHeadId: int("fee_head_id").notNull(),
  amount: int("amount", { unsigned: true }).notNull(),
});

export const feePayments = mysqlTable("fee_payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  studentId: int("student_id").notNull(),
  invoiceId: int("invoice_id").notNull(),
  amountPaid: int("amount_paid", { unsigned: true }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(),
  transactionRef: varchar("transaction_ref", { length: 100 }),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type AcademicYear = typeof academicYears.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type FeeHead = typeof feeHeads.$inferSelect;
export type DocumentType = typeof documentTypes.$inferSelect;
export type AdmApplication = typeof admApplications.$inferSelect;
export type FeeStructure = typeof feeStructures.$inferSelect;
export type FeeInvoice = typeof feeInvoices.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type StudentParent = typeof studentParents.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Exams and Marks Tables
export const examTypes = mysqlTable("exam_types", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  weightage: int("weightage", { unsigned: true }).default(100).notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  examTypeId: int("exam_type_id").notNull(),
  academicYearId: int("academic_year_id").notNull(),
  classId: int("class_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalMarks: int("total_marks", { unsigned: true }).notNull(),
  passingMarks: int("passing_marks", { unsigned: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("SCHEDULED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examSubjects = mysqlTable("exam_subjects", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  examId: int("exam_id").notNull(),
  subjectId: int("subject_id").notNull(),
  maxMarks: int("max_marks", { unsigned: true }).notNull(),
  passingMarks: int("passing_marks", { unsigned: true }).notNull(),
  examDate: timestamp("exam_date").notNull(),
});

export const studentMarks = mysqlTable("student_marks", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  examSubjectId: int("exam_subject_id").notNull(),
  marksObtained: int("marks_obtained", { unsigned: true }).notNull(),
  isAbsent: int("is_absent", { unsigned: true }).default(0).notNull(),
  grade: varchar("grade", { length: 10 }),
  remarks: text("remarks"),
  enteredBy: int("entered_by").notNull(),
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const gradeScales = mysqlTable("grade_scales", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  gradeName: varchar("grade_name", { length: 10 }).notNull().unique(),
  minPercentage: int("min_percentage", { unsigned: true }).notNull(),
  maxPercentage: int("max_percentage", { unsigned: true }).notNull(),
  gradePoints: int("grade_points", { unsigned: true }).notNull(),
  description: text("description"),
  displayOrder: int("display_order").notNull(),
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportCards = mysqlTable("report_cards", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  examId: int("exam_id").notNull(),
  totalMarks: int("total_marks", { unsigned: true }).notNull(),
  marksObtained: int("marks_obtained", { unsigned: true }).notNull(),
  percentage: int("percentage", { unsigned: true }).notNull(),
  overallGrade: varchar("overall_grade", { length: 10 }),
  rank: int("rank", { unsigned: true }),
  remarks: text("remarks"),
  pdfUrl: text("pdf_url"),
  generatedBy: int("generated_by").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type ExamType = typeof examTypes.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type ExamSubject = typeof examSubjects.$inferSelect;
export type StudentMark = typeof studentMarks.$inferSelect;
export type GradeScale = typeof gradeScales.$inferSelect;
export type ReportCard = typeof reportCards.$inferSelect;

// Communication System Tables
export const messageTemplates = mysqlTable("message_templates", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["attendance", "fees", "marks", "general", "festival"]).notNull(),
  channel: mysqlEnum("channel", ["sms", "whatsapp", "both"]).notNull(),
  subject: varchar("subject", { length: 200 }),
  content: text("content").notNull(),
  variables: text("variables"), // JSON array of available variables like {studentName}, {amount}, etc.
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  recipientType: mysqlEnum("recipient_type", ["parent", "student", "staff", "all_parents"]).notNull(),
  recipientId: int("recipient_id"), // null for bulk messages
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  recipientName: varchar("recipient_name", { length: 200 }),
  channel: mysqlEnum("channel", ["sms", "whatsapp"]).notNull(),
  templateId: int("template_id"),
  subject: varchar("subject", { length: 200 }),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "delivered"]).default("pending").notNull(),
  deliveryStatus: text("delivery_status"), // JSON with provider response
  sentBy: int("sent_by").notNull(),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledMessages = mysqlTable("scheduled_messages", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  templateId: int("template_id").notNull(),
  recipientType: mysqlEnum("recipient_type", ["all_parents", "all_students", "all_staff", "specific_class"]).notNull(),
  classId: int("class_id"), // for specific_class type
  channel: mysqlEnum("channel", ["sms", "whatsapp", "both"]).notNull(),
  scheduleType: mysqlEnum("schedule_type", ["once", "daily", "weekly", "monthly", "yearly"]).notNull(),
  scheduleDate: timestamp("schedule_date"), // for once type
  scheduleTime: varchar("schedule_time", { length: 10 }), // HH:MM format
  scheduleDayOfWeek: int("schedule_day_of_week"), // 0-6 for weekly
  scheduleDayOfMonth: int("schedule_day_of_month"), // 1-31 for monthly
  scheduleMonthDay: varchar("schedule_month_day", { length: 10 }), // MM-DD for yearly (festivals)
  isActive: int("is_active", { unsigned: true }).default(1).notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  role: mysqlEnum("role", ["admin", "principal", "teacher", "accountant", "parent", "student"]).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., "students", "fees", "exams"
  action: mysqlEnum("action", ["create", "read", "update", "delete", "all"]).notNull(),
  isAllowed: int("is_allowed", { unsigned: true }).default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  userId: int("user_id").notNull(),
  userName: varchar("user_name", { length: 200 }),
  userRole: varchar("user_role", { length: 50 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "create_student", "update_fee", "delete_exam"
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., "students", "fees"
  resourceId: int("resource_id"),
  details: text("details"), // JSON with before/after values
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

// Attendance System
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "half_day"]).notNull(),
  remarks: text("remarks"),
  markedBy: int("marked_by").notNull(), // staff user id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const leaveApplications = mysqlTable("leave_applications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  studentId: int("student_id").notNull(),
  parentId: int("parent_id").notNull(), // user id of parent who applied
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewed_by"), // staff user id who approved/rejected
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const parentNotifications = mysqlTable("parent_notifications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  parentId: int("parent_id").notNull(), // user id
  studentId: int("student_id"), // optional, for student-specific notifications
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["attendance", "marks", "fees", "general", "announcement"]).notNull(),
  isRead: int("is_read", { unsigned: true }).default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type LeaveApplication = typeof leaveApplications.$inferSelect;
export type ParentNotification = typeof parentNotifications.$inferSelect;

// OTP Verification System
export const otpVerifications = mysqlTable("otp_verifications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  purpose: mysqlEnum("purpose", ["parent_registration", "password_reset", "phone_verification"]).notNull(),
  isVerified: int("is_verified", { unsigned: true }).default(0).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
