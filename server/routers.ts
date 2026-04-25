import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Master Data
  masterData: router({
    // Read operations (public)
    academicYears: publicProcedure.query(() => db.getAcademicYears()),
    classes: publicProcedure.query(() => db.getClasses()),
    feeHeads: publicProcedure.query(() => db.getFeeHeads()),
    documentTypes: publicProcedure.query(() => db.getDocumentTypes()),
    sections: publicProcedure
      .input(z.object({ classId: z.number() }))
      .query(({ input }) => db.getSectionsByClass(input.classId)),
    subjects: publicProcedure.query(() => db.getAllSubjects()),
    staff: publicProcedure.query(() => db.getAllStaff()),

    // Academic Years CRUD
    createAcademicYear: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .mutation(({ input }) =>
        db.createAcademicYear({
          name: input.name,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        })
      ),
    updateAcademicYear: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateAcademicYear(id, {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
      }),
    deleteAcademicYear: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAcademicYear(input.id)),

    // Classes CRUD
    createClass: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          displayOrder: z.number(),
        })
      )
      .mutation(({ input }) => db.createClass(input)),
    updateClass: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          displayOrder: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateClass(id, data);
      }),
    deleteClass: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteClass(input.id)),

    // Sections CRUD
    createSection: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          classId: z.number(),
          capacity: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.createSection(input)),
    updateSection: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          capacity: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSection(id, data);
      }),
    deleteSection: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteSection(input.id)),

    // Fee Heads CRUD
    createFeeHead: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createFeeHead(input)),
    updateFeeHead: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateFeeHead(id, data);
      }),
    deleteFeeHead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteFeeHead(input.id)),

    // Subjects CRUD
    createSubject: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          code: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createSubject(input)),
    updateSubject: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          code: z.string().optional(),
          description: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSubject(id, data);
      }),
    deleteSubject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteSubject(input.id)),

    // Document Types CRUD
    createDocumentType: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          isRequired: z.number(),
        })
      )
      .mutation(({ input }) => db.createDocumentType(input)),
    updateDocumentType: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          isRequired: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDocumentType(id, data);
      }),
    deleteDocumentType: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDocumentType(input.id)),

    // Staff CRUD
    createStaff: protectedProcedure
      .input(
        z.object({
          staffNo: z.string().min(1),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          role: z.string().min(1),
          department: z.string().optional(),
          dateOfJoining: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.createStaff({
          ...input,
          dateOfJoining: input.dateOfJoining ? new Date(input.dateOfJoining) : undefined,
        })
      ),
    updateStaff: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          role: z.string().optional(),
          department: z.string().optional(),
          dateOfJoining: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateStaff(id, {
          ...data,
          dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
        });
      }),
    deleteStaff: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStaff(input.id)),
  }),

  // Admissions Management
  admissions: router({
    createApplication: protectedProcedure
      .input(
        z.object({
          academicYearId: z.number(),
          classId: z.number(),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          dateOfBirth: z.string(),
          gender: z.enum(["Male", "Female", "Other"]),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Generate application number
        const year = new Date().getFullYear();
        const count = await db.getApplications();
        const appNo = `APP-${year}-${String(count.length + 1).padStart(5, "0")}`;

        const application = await db.createApplication({
          id: nanoid(),
          applicationNo: appNo,
          academicYearId: input.academicYearId,
          classId: input.classId,
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          createdBy: ctx.user.id,
        });

        return {
          id: application.id,
          applicationNo: application.applicationNo,
          status: "SUBMITTED",
        };
      }),

    listApplications: protectedProcedure
      .input(
        z.object({
          academicYearId: z.number().optional(),
          classId: z.number().optional(),
          status: z.string().optional(),
        })
      )
      .query(({ input }) => db.getApplications(input)),

    getApplicationById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const application = await db.getApplicationById(input.id);
        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found",
          });
        }
        return application;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.string(),
          newStatus: z.enum([
            "SUBMITTED",
            "UNDER_REVIEW",
            "APPROVED",
            "REJECTED",
            "ENROLLED",
          ]),
          remarks: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.updateApplicationStatus({
          applicationId: input.applicationId,
          newStatus: input.newStatus,
          remarks: input.remarks,
          changedBy: ctx.user.id,
        })
      ),
  }),

  // Fees Management
  fees: router({
    createStructure: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          academicYearId: z.number(),
          classId: z.number(),
          components: z.array(
            z.object({
              feeHeadId: z.number(),
              amount: z.number().min(0),
            })
          ),
        })
      )
      .mutation(({ input }) => db.createFeeStructure(input)),

    listStructures: protectedProcedure
      .input(
        z.object({
          academicYearId: z.number().optional(),
          classId: z.number().optional(),
        })
      )
      .query(({ input }) => db.getFeeStructures(input)),

    getStructureById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const structure = await db.getFeeStructureById(input.id);
        if (!structure) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fee structure not found",
          });
        }
        return structure;
      }),

    listInvoices: protectedProcedure
      .input(
        z.object({
          studentId: z.number().optional(),
          status: z.string().optional(),
        })
      )
      .query(({ input }) => db.getInvoices(input)),

    recordPayment: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          invoiceId: z.number(),
          amountPaid: z.number().min(0),
          paymentDate: z.string(),
          paymentMode: z.enum(["CASH", "BANK_TRANSFER", "ONLINE", "CHEQUE"]),
          transactionRef: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.recordPayment({
          id: nanoid(),
          studentId: input.studentId,
          invoiceId: input.invoiceId,
          amountPaid: input.amountPaid,
          paymentDate: new Date(input.paymentDate),
          paymentMode: input.paymentMode,
          transactionRef: input.transactionRef,
          createdBy: ctx.user.id,
        });

        // Send payment confirmation notification
        try {
          const { sendFeePaymentConfirmation } = await import("./_core/notifications");
          const student = await db.getStudentById(input.studentId);
          const parents = await db.getParentPhoneNumbers(input.studentId);
          
          if (student && parents.length > 0) {
            for (const parent of parents) {
              await sendFeePaymentConfirmation({
                studentName: `${student.firstName} ${student.lastName}`,
                parentName: parent.name,
                parentPhone: parent.phone,
                amount: input.amountPaid,
                invoiceNumber: input.invoiceId.toString(),
              });
            }
          }
        } catch (error) {
          console.error("Failed to send payment confirmation:", error);
        }

        return result;
      }),
  }),

  // Student Management
  students: router({
    list: protectedProcedure
      .input(
        z.object({
          classId: z.number().optional(),
          sectionId: z.number().optional(),
          academicYearId: z.number().optional(),
          status: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(({ input }) => db.getStudents(input)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getStudentById(input.id)),

    enrollFromApplication: protectedProcedure
      .input(
        z.object({
          applicationId: z.string(),
          sectionId: z.number().optional(),
          rollNo: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.enrollStudentFromApplication(input.applicationId, {
          sectionId: input.sectionId,
          rollNo: input.rollNo,
        })
      ),

    create: protectedProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          dateOfBirth: z.string(),
          gender: z.enum(["Male", "Female", "Other"]),
          bloodGroup: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          pincode: z.string().optional(),
          classId: z.number(),
          sectionId: z.number().optional(),
          academicYearId: z.number(),
          rollNo: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.createStudent({
          ...input,
          dateOfBirth: new Date(input.dateOfBirth),
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          dateOfBirth: z.string().optional(),
          gender: z.enum(["Male", "Female", "Other"]).optional(),
          bloodGroup: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          pincode: z.string().optional(),
          classId: z.number().optional(),
          sectionId: z.number().optional(),
          rollNo: z.string().optional(),
          status: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateStudent(id, {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        });
      }),

    addParent: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          relationship: z.string().min(1),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().min(1),
          occupation: z.string().optional(),
          isPrimary: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.addStudentParent(input)),

    getParents: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getStudentParents(input.studentId)),

    // Document management
    addDocument: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          documentTypeId: z.number(),
          filePath: z.string(),
        })
      )
      .mutation(({ input }) => db.addStudentDocument(input)),

    getDocuments: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getStudentDocuments(input.studentId)),

    deleteDocument: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteStudentDocument(input.id)),

    // Fee and payment management
    getInvoices: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getStudentInvoices(input.studentId)),

    getPayments: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getStudentPayments(input.studentId)),

    generateInvoice: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          feeStructureId: z.number(),
          dueDate: z.string(),
        })
      )
      .mutation(({ input }) =>
        db.generateStudentInvoice({
          ...input,
          dueDate: new Date(input.dueDate),
        })
      ),
  }),

  // Staff Management & HRMS
  staff: router({
    // Staff listing with salary info
    listWithSalary: protectedProcedure.query(() => db.getAllStaffWithSalary()),

    // Salary Management
    createSalary: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          basicSalary: z.number().min(0),
          allowances: z.number().min(0).optional(),
          deductions: z.number().min(0).optional(),
          effectiveFrom: z.string(),
        })
      )
      .mutation(({ input }) =>
        db.createStaffSalary({
          ...input,
          effectiveFrom: new Date(input.effectiveFrom),
        })
      ),

    getCurrentSalary: protectedProcedure
      .input(z.object({ staffId: z.number() }))
      .query(({ input }) => db.getStaffCurrentSalary(input.staffId)),

    getSalaryHistory: protectedProcedure
      .input(z.object({ staffId: z.number() }))
      .query(({ input }) => db.getStaffSalaryHistory(input.staffId)),

    // Payment Management
    recordPayment: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          paymentDate: z.string(),
          month: z.number().min(1).max(12),
          year: z.number(),
          amount: z.number().min(0),
          paymentMode: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"]),
          referenceNo: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.recordStaffPayment({
          ...input,
          paymentDate: new Date(input.paymentDate),
          createdBy: ctx.user.id,
        })
      ),

    getPayments: protectedProcedure
      .input(z.object({ staffId: z.number() }))
      .query(({ input }) => db.getStaffPayments(input.staffId)),

    getPaymentsByPeriod: protectedProcedure
      .input(
        z.object({
          month: z.number().min(1).max(12),
          year: z.number(),
        })
      )
      .query(({ input }) => db.getStaffPaymentsByPeriod(input.month, input.year)),

    // Leave Management
    applyLeave: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          leaveTypeId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
          days: z.number().min(0.5),
          reason: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.applyLeave({
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        })
      ),

    getLeaves: protectedProcedure
      .input(z.object({ staffId: z.number() }))
      .query(({ input }) => db.getStaffLeaves(input.staffId)),

    getPendingLeaves: protectedProcedure.query(() => db.getPendingLeaves()),

    approveLeave: protectedProcedure
      .input(z.object({ leaveId: z.number() }))
      .mutation(({ input, ctx }) => db.approveLeave(input.leaveId, ctx.user.id)),

    rejectLeave: protectedProcedure
      .input(z.object({ leaveId: z.number() }))
      .mutation(({ input, ctx }) => db.rejectLeave(input.leaveId, ctx.user.id)),

    getLeaveBalance: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          leaveTypeId: z.number(),
        })
      )
      .query(({ input }) => db.getStaffLeaveBalance(input.staffId, input.leaveTypeId)),

    // Leave Types Management
    getLeaveTypes: protectedProcedure.query(() => db.getAllLeaveTypes()),

    createLeaveType: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          maxDaysPerYear: z.number().min(0),
          isPaid: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createLeaveType(input)),
  }),

  // Exams & Marks Management
  exams: router({ // Exam Types
    getExamTypes: publicProcedure.query(() => db.getExamTypes()),

    createExamType: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          weightage: z.number().min(0).default(100),
        })
      )
      .mutation(({ input }) => db.createExamType(input)),

    updateExamType: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          weightage: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateExamType(id, data);
      }),

    // Exams
    createExam: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          examTypeId: z.number(),
          academicYearId: z.number(),
          classId: z.number(),
          startDate: z.string(),
          endDate: z.string(),
          totalMarks: z.number().min(0),
          passingMarks: z.number().min(0),
          subjects: z.array(
            z.object({
              subjectId: z.number(),
              maxMarks: z.number().min(0),
              passingMarks: z.number().min(0),
              examDate: z.string(),
            })
          ),
        })
      )
      .mutation(({ input }) =>
        db.createExam({
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          subjects: input.subjects.map((s) => ({
            ...s,
            examDate: new Date(s.examDate),
          })),
        })
      ),

    getExams: publicProcedure
      .input(
        z
          .object({
            academicYearId: z.number().optional(),
            classId: z.number().optional(),
            examTypeId: z.number().optional(),
            status: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => db.getExams(input)),

    getExamById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getExamById(input.id)),

    updateExamStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"]),
        })
      )
      .mutation(({ input }) => db.updateExamStatus(input.id, input.status)),

    // Marks Entry
    enterMarks: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          examSubjectId: z.number(),
          marksObtained: z.number().min(0),
          isAbsent: z.number().optional(),
          remarks: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.enterMarks({
          ...input,
          enteredBy: ctx.user.id,
        })
      ),

    bulkEnterMarks: protectedProcedure
      .input(
        z.object({
          marks: z.array(
            z.object({
              studentId: z.number(),
              examSubjectId: z.number(),
              marksObtained: z.number().min(0),
              isAbsent: z.number().optional(),
              remarks: z.string().optional(),
            })
          ),
        })
      )
      .mutation(({ input, ctx }) =>
        db.bulkEnterMarks(
          input.marks.map((m) => ({
            ...m,
            enteredBy: ctx.user.id,
          }))
        )
      ),

    getStudentMarks: publicProcedure
      .input(
        z.object({
          studentId: z.number(),
          examId: z.number().optional(),
          academicYearId: z.number().optional(),
        })
      )
      .query(({ input }) => {
        const { studentId, ...filters } = input;
        return db.getStudentMarks(studentId, filters);
      }),

    getExamMarks: publicProcedure
      .input(
        z.object({
          examId: z.number(),
          subjectId: z.number().optional(),
        })
      )
      .query(({ input }) => db.getExamMarks(input.examId, input.subjectId)),

    // Analytics
    getPerformanceAnalytics: publicProcedure
      .input(
        z.object({
          academicYearId: z.number().optional(),
          classId: z.number().optional(),
          examId: z.number().optional(),
        })
      )
      .query(({ input }) => db.getPerformanceAnalytics(input)),

    getSubjectWisePerformance: publicProcedure
      .input(
        z.object({
          academicYearId: z.number().optional(),
          classId: z.number().optional(),
          examId: z.number().optional(),
        })
      )
      .query(({ input }) => db.getSubjectWisePerformance(input)),

    getTopPerformers: publicProcedure
      .input(
        z.object({
          academicYearId: z.number().optional(),
          classId: z.number().optional(),
          examId: z.number().optional(),
          limit: z.number().optional(),
        })
      )
      .query(({ input }) => db.getTopPerformers(input)),
  }),

  // Grade Management
  grades: router({
    getGradeScales: publicProcedure.query(() => db.getGradeScales()),

    createGradeScale: protectedProcedure
      .input(
        z.object({
          gradeName: z.string(),
          minPercentage: z.number(),
          maxPercentage: z.number(),
          gradePoints: z.number(),
          description: z.string().optional(),
          displayOrder: z.number(),
        })
      )
      .mutation(({ input }) => db.createGradeScale(input)),

    updateGradeScale: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          gradeName: z.string().optional(),
          minPercentage: z.number().optional(),
          maxPercentage: z.number().optional(),
          gradePoints: z.number().optional(),
          description: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateGradeScale(id, data);
      }),

    deleteGradeScale: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteGradeScale(input.id)),

    calculateGrade: publicProcedure
      .input(z.object({ percentage: z.number() }))
      .query(({ input }) => db.calculateGrade(input.percentage)),
  }),

  // Report Cards
  reportCards: router({
    generate: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          examId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.generateReportCard({
          ...input,
          generatedBy: ctx.user.id,
        });
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No marks found for this student and exam. Please enter marks first.",
          });
        }
        return result;
      }),

    bulkGenerate: protectedProcedure
      .input(
        z.object({
          examId: z.number(),
          studentIds: z.array(z.number()),
        })
      )
      .mutation(({ input, ctx }) =>
        db.bulkGenerateReportCards({
          ...input,
          generatedBy: ctx.user.id,
        })
      ),

    getReportCard: publicProcedure
      .input(
        z.object({
          studentId: z.number(),
          examId: z.number(),
        })
      )
      .query(({ input }) => db.getReportCard(input.studentId, input.examId)),

    getStudentReportCards: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getStudentReportCards(input.studentId)),
  }),

  // Communication System
  communication: router({
    // Message Templates
    getTemplates: protectedProcedure
      .input(
        z.object({
          category: z.enum(["attendance", "fees", "marks", "general", "festival"]).optional(),
          channel: z.enum(["sms", "whatsapp", "both"]).optional(),
        }).optional()
      )
      .query(({ input }) => db.getMessageTemplates(input)),

    getTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getMessageTemplate(input.id)),

    createTemplate: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          category: z.enum(["attendance", "fees", "marks", "general", "festival"]),
          channel: z.enum(["sms", "whatsapp", "both"]),
          subject: z.string().optional(),
          content: z.string(),
          variables: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.createMessageTemplate({
          ...input,
          createdBy: ctx.user.id,
        })
      ),

    updateTemplate: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.enum(["attendance", "fees", "marks", "general", "festival"]).optional(),
          channel: z.enum(["sms", "whatsapp", "both"]).optional(),
          subject: z.string().optional(),
          content: z.string().optional(),
          variables: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMessageTemplate(id, data);
      }),

    deleteTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteMessageTemplate(input.id)),

    // Send Messages
    sendMessage: protectedProcedure
      .input(
        z.object({
          recipientType: z.enum(["parent", "student", "staff", "all_parents"]),
          recipientId: z.number().optional(),
          recipientPhone: z.string(),
          recipientName: z.string().optional(),
          channel: z.enum(["sms", "whatsapp"]),
          templateId: z.number().optional(),
          subject: z.string().optional(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { sendMessage, formatPhoneNumber } = await import("./_core/sms");
        
        // Create message record
        const message = await db.createMessage({
          ...input,
          sentBy: ctx.user.id,
        });

        // Send via SMS/WhatsApp
        const formattedPhone = formatPhoneNumber(input.recipientPhone);
        const result = await sendMessage({
          to: formattedPhone,
          message: input.content,
          channel: input.channel,
        });

        // Update message status
        await db.updateMessageStatus(message.id, {
          status: result.success ? "sent" : "failed",
          deliveryStatus: JSON.stringify(result),
          sentAt: result.success ? new Date() : undefined,
        });

        return { ...message, deliveryResult: result };
      }),

    sendBulkMessage: protectedProcedure
      .input(
        z.object({
          recipientType: z.enum(["all_parents", "specific_class"]),
          classId: z.number().optional(),
          channel: z.enum(["sms", "whatsapp"]),
          templateId: z.number().optional(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { sendMessage, formatPhoneNumber } = await import("./_core/sms");
        
        // Get recipient phone numbers
        const recipients = await db.getParentPhoneNumbers();
        
        const results = [];
        for (const recipient of recipients) {
          // Create message record
          const message = await db.createMessage({
            recipientType: "parent",
            recipientPhone: recipient.phone,
            recipientName: recipient.name,
            channel: input.channel,
            templateId: input.templateId,
            content: input.content,
            sentBy: ctx.user.id,
          });

          // Send message
          const formattedPhone = formatPhoneNumber(recipient.phone);
          const result = await sendMessage({
            to: formattedPhone,
            message: input.content,
            channel: input.channel,
          });

          // Update status
          await db.updateMessageStatus(message.id, {
            status: result.success ? "sent" : "failed",
            deliveryStatus: JSON.stringify(result),
            sentAt: result.success ? new Date() : undefined,
          });

          results.push({ recipient: recipient.name, success: result.success });
        }

        return { total: recipients.length, results };
      }),

    getMessages: protectedProcedure
      .input(
        z.object({
          recipientType: z.enum(["parent", "student", "staff", "all_parents"]).optional(),
          recipientId: z.number().optional(),
          channel: z.enum(["sms", "whatsapp"]).optional(),
          status: z.enum(["pending", "sent", "failed", "delivered"]).optional(),
          limit: z.number().optional(),
        }).optional()
      )
      .query(({ input }) => db.getMessages(input)),

    // Scheduled Messages
    getScheduledMessages: protectedProcedure
      .input(
        z.object({
          isActive: z.boolean().optional(),
        }).optional()
      )
      .query(({ input }) => db.getScheduledMessages(input)),

    createScheduledMessage: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          templateId: z.number(),
          recipientType: z.enum(["all_parents", "all_students", "all_staff", "specific_class"]),
          classId: z.number().optional(),
          channel: z.enum(["sms", "whatsapp", "both"]),
          scheduleType: z.enum(["once", "daily", "weekly", "monthly", "yearly"]),
          scheduleDate: z.date().optional(),
          scheduleTime: z.string().optional(),
          scheduleDayOfWeek: z.number().optional(),
          scheduleDayOfMonth: z.number().optional(),
          scheduleMonthDay: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.createScheduledMessage({
          ...input,
          createdBy: ctx.user.id,
        })
      ),

    updateScheduledMessage: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          templateId: z.number().optional(),
          scheduleType: z.enum(["once", "daily", "weekly", "monthly", "yearly"]).optional(),
          scheduleDate: z.date().optional(),
          scheduleTime: z.string().optional(),
          scheduleDayOfWeek: z.number().optional(),
          scheduleDayOfMonth: z.number().optional(),
          scheduleMonthDay: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateScheduledMessage(id, data);
      }),

    deleteScheduledMessage: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteScheduledMessage(input.id)),
  }),

  // Parent Registration & OTP
  parentAuth: router({
    sendOTP: publicProcedure
      .input(
        z.object({
          studentNo: z.string(),
          phone: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Find parent by student roll number and phone
        const parent = await db.findParentByStudentRollAndPhone(input.studentNo, input.phone);
        
        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No parent record found with this student roll number and phone number",
          });
        }
        
        // Check if already linked to a user
        if (parent.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This parent is already registered. Please login instead.",
          });
        }
        
        // Generate OTP
        const otp = await db.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
        
        // Save OTP to database
        await db.createOTPVerification({
          phone: input.phone,
          otp,
          purpose: "parent_registration",
          expiresAt,
        });
        
        // Send OTP via SMS
        const { sendSMS } = await import("./_core/sms");
        await sendSMS({
          to: input.phone,
          message: `Your OTP for parent registration is: ${otp}. Valid for 10 minutes. Student: ${parent.studentName}`,
          channel: "sms",
        });
        
        return {
          success: true,
          message: "OTP sent to your registered mobile number",
          studentName: parent.studentName,
        };
      }),

    verifyOTPAndRegister: publicProcedure
      .input(
        z.object({
          studentNo: z.string(),
          phone: z.string(),
          otp: z.string(),
          name: z.string(),
          email: z.string().email().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Verify OTP
        const isValid = await db.verifyOTP(input.phone, input.otp, "parent_registration");
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired OTP",
          });
        }
        
        // Find parent record again
        const parent = await db.findParentByStudentRollAndPhone(input.studentNo, input.phone);
        
        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent record not found",
          });
        }
        
        // Create user account
        const openId = nanoid();
        await db.upsertUser({
          openId,
          name: input.name,
          email: input.email || parent.email || undefined,
          loginMethod: "phone",
          role: "parent",
        });
        
        // Get the created user
        const user = await db.getUserByOpenId(openId);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user account",
          });
        }
        
        // Link parent to user
        await db.linkParentToUser(parent.id, user.id);
        
        return {
          success: true,
          message: "Registration successful! You can now login.",
          userId: user.id,
        };
      }),
  }),

  // Attendance Management
  attendance: router({
    markAttendance: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          date: z.date(),
          status: z.enum(["present", "absent", "late", "half_day"]),
          remarks: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await db.markAttendance({
          ...input,
          markedBy: ctx.user!.id,
        });
        
        // TODO: Send notification to parent if student is absent
        
        return { id };
      }),

    bulkMarkAttendance: protectedProcedure
      .input(
        z.object({
          records: z.array(
            z.object({
              studentId: z.number(),
              date: z.date(),
              status: z.enum(["present", "absent", "late", "half_day"]),
              remarks: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const record of input.records) {
          const id = await db.markAttendance({
            ...record,
            markedBy: ctx.user!.id,
          });
          results.push({ studentId: record.studentId, id });
          
          // TODO: Send notification for absent students
        }
        return { success: true, count: results.length };
      }),

    getAttendance: protectedProcedure
      .input(
        z.object({
          studentId: z.number().optional(),
          classId: z.number().optional(),
          date: z.date().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          status: z.enum(["present", "absent", "late", "half_day"]).optional(),
        })
      )
      .query(({ input }) => db.getAttendance(input)),

    getAttendanceStats: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(({ input }) => db.getAttendanceStats(input.studentId, input.startDate, input.endDate)),

    // Leave Applications
    applyLeave: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createLeaveApplication({
          ...input,
          parentId: ctx.user!.id,
        });
      }),

    getLeaveApplications: protectedProcedure
      .input(
        z.object({
          studentId: z.number().optional(),
          parentId: z.number().optional(),
          status: z.enum(["pending", "approved", "rejected"]).optional(),
        })
      )
      .query(({ input }) => db.getLeaveApplications(input)),

    updateLeaveApplication: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
          reviewComments: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateLeaveApplication(input.id, {
          status: input.status,
          reviewedBy: ctx.user!.id,
          reviewComments: input.reviewComments,
        });
        return { success: true };
      }),
  }),

  // Parent Portal
  parentPortal: router({
    getMyChildren: protectedProcedure.query(({ ctx }) => {
      return db.getParentChildren(ctx.user!.id);
    }),

    getChildPerformance: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => db.getChildPerformanceSummary(input.studentId)),

    getChildAttendance: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(({ input }) => {
        return Promise.all([
          db.getAttendance({
            studentId: input.studentId,
            startDate: input.startDate,
            endDate: input.endDate,
          }),
          db.getAttendanceStats(input.studentId, input.startDate, input.endDate),
        ]).then(([records, stats]) => ({ records, stats }));
      }),

    getNotifications: protectedProcedure
      .input(
        z.object({
          isRead: z.boolean().optional(),
          category: z.enum(["attendance", "marks", "fees", "general", "announcement"]).optional(),
          limit: z.number().optional(),
        })
      )
      .query(({ input, ctx }) => {
        return db.getParentNotifications(ctx.user!.id, input);
      }),

    markNotificationAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(({ input }) => {
        return db.markNotificationAsRead(input.notificationId);
      }),
  }),

  // Analytics & Dashboard
  analytics: router({
    students: protectedProcedure.query(() => db.getStudentAnalytics()),
    financial: protectedProcedure.query(() => db.getFinancialAnalytics()),
    admissions: protectedProcedure.query(async () => {
      const applications = await db.getApplicationsRaw();
      const byStatus: Record<string, number> = {};
      const byClass: Record<number, number> = {};
      applications.forEach((app) => {
        byStatus[app.status] = (byStatus[app.status] || 0) + 1;
        byClass[app.classId] = (byClass[app.classId] || 0) + 1;
      });
      return {
        total: applications.length,
        byStatus,
        byClass,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
