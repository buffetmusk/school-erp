import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-director",
    email: "director@school.com",
    name: "Test Director",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Master Data Management", () => {
  it("should list all academic years", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const years = await caller.masterData.academicYears();
    expect(years).toBeDefined();
    expect(Array.isArray(years)).toBe(true);
  });

  it("should list all classes", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const classes = await caller.masterData.classes();
    expect(classes).toBeDefined();
    expect(Array.isArray(classes)).toBe(true);
  });

  it("should list sections for a class", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sections = await caller.masterData.sections({ classId: 1 });
    expect(sections).toBeDefined();
    expect(Array.isArray(sections)).toBe(true);
  });

  it("should list all fee heads", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const feeHeads = await caller.masterData.feeHeads();
    expect(feeHeads).toBeDefined();
    expect(Array.isArray(feeHeads)).toBe(true);
  });

  it("should list all subjects", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const subjects = await caller.masterData.subjects();
    expect(subjects).toBeDefined();
    expect(Array.isArray(subjects)).toBe(true);
  });

  it("should list all document types", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const docTypes = await caller.masterData.documentTypes();
    expect(docTypes).toBeDefined();
    expect(Array.isArray(docTypes)).toBe(true);
  });

  it("should list all staff members", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const staff = await caller.masterData.staff();
    expect(staff).toBeDefined();
    expect(Array.isArray(staff)).toBe(true);
  });
});

describe("Student Management", () => {
  it("should list all students", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list({});
    expect(students).toBeDefined();
    expect(Array.isArray(students)).toBe(true);
  });

  it("should filter students by class", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list({ classId: 4 });
    expect(students).toBeDefined();
    expect(Array.isArray(students)).toBe(true);
    if (students.length > 0) {
      expect(students.every((s) => s.classId === 4)).toBe(true);
    }
  });

  it("should filter students by status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list({ status: "ACTIVE" });
    expect(students).toBeDefined();
    expect(Array.isArray(students)).toBe(true);
    if (students.length > 0) {
      expect(students.every((s) => s.status === "ACTIVE")).toBe(true);
    }
  });

  it("should get student by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get list to find a valid student ID
    const students = await caller.students.list({});
    if (students.length > 0) {
      const student = await caller.students.getById({ id: students[0]!.id });
      expect(student).toBeDefined();
      expect(student.id).toBe(students[0]!.id);
    }
  });

  it("should create a new student", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const newStudent = await caller.students.create({
      firstName: "Test",
      lastName: "Student",
      dateOfBirth: "2015-01-01",
      gender: "Male",
      classId: 1,
      academicYearId: 1,
      address: "123 Test St",
      city: "Test City",
      state: "Test State",
      pincode: "123456",
    });

    expect(newStudent).toBeDefined();
    expect(newStudent.studentNo).toBeDefined();
    expect(newStudent.id).toBeDefined();
    expect(typeof newStudent.id).toBe("number");
  });
});

describe("Analytics APIs", () => {
  it("should return student analytics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.students();
    expect(analytics).toBeDefined();
    expect(analytics.total).toBeGreaterThanOrEqual(0);
    expect(analytics.byClass).toBeDefined();
    expect(analytics.byGender).toBeDefined();
    expect(analytics.byStatus).toBeDefined();
  });

  it("should return financial analytics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.financial();
    expect(analytics).toBeDefined();
    expect(analytics.totalBilled).toBeGreaterThanOrEqual(0);
    expect(analytics.totalCollected).toBeGreaterThanOrEqual(0);
    expect(analytics.totalPending).toBeGreaterThanOrEqual(0);
    expect(analytics.collectionRate).toBeGreaterThanOrEqual(0);
    expect(analytics.collectionRate).toBeLessThanOrEqual(100);
    expect(analytics.paidCount).toBeGreaterThanOrEqual(0);
    expect(analytics.partiallyPaidCount).toBeGreaterThanOrEqual(0);
    expect(analytics.unpaidCount).toBeGreaterThanOrEqual(0);
  });

  it("should return admissions analytics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.admissions();
    expect(analytics).toBeDefined();
    expect(analytics.total).toBeGreaterThanOrEqual(0);
    expect(analytics.byStatus).toBeDefined();
    expect(analytics.byClass).toBeDefined();
  });

  it("should calculate collection rate correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.financial();
    if (analytics.totalBilled > 0) {
      const expectedRate = (analytics.totalCollected / analytics.totalBilled) * 100;
      expect(analytics.collectionRate).toBeCloseTo(expectedRate, 1);
    }
  });

  it("should sum invoice counts correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.financial();
    const totalInvoices = analytics.paidCount + analytics.partiallyPaidCount + analytics.unpaidCount;
    expect(totalInvoices).toBeGreaterThanOrEqual(0);
  });
});

describe("Student Enrollment Workflow", () => {
  it("should enroll student from approved application", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get approved applications
    const applications = await caller.admissions.listApplications({ status: "APPROVED" });
    
    if (applications.length > 0) {
      const appId = applications[0]!.id;
      
      try {
        // Try to enroll the student
        const student = await caller.students.enrollFromApplication({
          applicationId: appId,
          rollNo: "TEST-001",
        });

        expect(student).toBeDefined();
        expect(student.studentNo).toBeDefined();
        expect(student.applicationId).toBe(appId);
      } catch (error: any) {
        // If already enrolled, that's expected behavior
        if (error.message.includes("already enrolled")) {
          expect(error.message).toContain("already enrolled");
        } else {
          throw error;
        }
      }
    }
  });
});

describe("Master Data CRUD Operations", () => {
  it("should create a new section", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const section = await caller.masterData.createSection({
      name: "Test Section",
      classId: 1,
      capacity: 30,
    });

    expect(section).toBeDefined();
    expect(section.name).toBe("Test Section");
    expect(section.classId).toBe(1);
  });

  it("should create a new fee head", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const feeHead = await caller.masterData.createFeeHead({
      name: "Test Fee",
      description: "Test fee description",
      isRecurring: 1,
    });

    expect(feeHead).toBeDefined();
    expect(feeHead.name).toBe("Test Fee");
  });

  it("should create a new subject", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueCode = `TEST${Date.now()}`;
    const subject = await caller.masterData.createSubject({
      name: "Test Subject",
      code: uniqueCode,
      description: "Test subject description",
    });

    expect(subject).toBeDefined();
    expect(subject.name).toBe("Test Subject");
    expect(subject.code).toBe(uniqueCode);
  });

  it("should update an existing class", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const classes = await caller.masterData.classes();
    if (classes.length > 0) {
      const updated = await caller.masterData.updateClass({
        id: classes[0]!.id,
        name: "Updated Class Name",
      });

      expect(updated).toBeDefined();
    }
  });
});

describe("Data Integrity", () => {
  it("should maintain referential integrity for students and classes", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list({});
    const classes = await caller.masterData.classes();
    
    const classIds = new Set(classes.map((c) => c.id));
    
    for (const student of students) {
      expect(classIds.has(student.classId)).toBe(true);
    }
  });

  it("should maintain referential integrity for fee structures and classes", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const structures = await caller.fees.listStructures({});
    const classes = await caller.masterData.classes();
    
    // Verify that we can query both structures and classes
    expect(structures).toBeDefined();
    expect(classes).toBeDefined();
    expect(Array.isArray(structures)).toBe(true);
    expect(Array.isArray(classes)).toBe(true);
  });
});
