import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@example.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Master Data", () => {
  it("should fetch academic years", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.masterData.academicYears();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should fetch classes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.masterData.classes();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should fetch fee heads", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.masterData.feeHeads();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should fetch document types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.masterData.documentTypes();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("Admissions Management", () => {
  let testApplicationId: string;

  it("should create a new application", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admissions.createApplication({
      academicYearId: 2,
      classId: 4,
      firstName: "Test",
      lastName: "Student",
      dateOfBirth: "2019-01-01",
      gender: "Male",
      contactEmail: "test@example.com",
      contactPhone: "1234567890",
    });

    expect(result).toBeDefined();
    expect(result.applicationNo).toMatch(/^APP-\d{4}-\d{5}$/);
    expect(result.status).toBe("SUBMITTED");
    testApplicationId = result.id;
  });

  it("should list all applications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admissions.listApplications({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter applications by status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admissions.listApplications({
      status: "SUBMITTED",
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get application by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first application from list
    const applications = await caller.admissions.listApplications({});
    if (applications.length > 0) {
      const result = await caller.admissions.getApplicationById({
        id: applications[0].id,
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(applications[0].id);
      expect(result.firstName).toBeDefined();
    }
  });

  it("should update application status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first application
    const applications = await caller.admissions.listApplications({});
    if (applications.length > 0) {
      const result = await caller.admissions.updateStatus({
        applicationId: applications[0].id,
        newStatus: "UNDER_REVIEW",
        remarks: "Test status update",
      });
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    }
  });
});

describe("Fees Management", () => {
  it("should create a fee structure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fees.createStructure({
      name: "Test Fee Structure",
      academicYearId: 2,
      classId: 5,
      components: [
        { feeHeadId: 1, amount: 10000 },
        { feeHeadId: 2, amount: 2000 },
      ],
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.totalAmount).toBe(12000);
  });

  it("should list all fee structures", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fees.listStructures({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter fee structures by class", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fees.listStructures({
      classId: 4,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get fee structure by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get first structure from list
    const structures = await caller.fees.listStructures({});
    if (structures.length > 0) {
      const result = await caller.fees.getStructureById({
        id: structures[0].id,
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(structures[0].id);
      expect(result.components).toBeDefined();
    }
  });

  it("should list all invoices", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fees.listInvoices({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should record a payment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fees.recordPayment({
      studentId: 1,
      invoiceId: 1,
      amountPaid: 10000,
      paymentDate: new Date().toISOString(),
      paymentMode: "CASH",
      transactionRef: "TEST-001",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("RBAC Enforcement", () => {
  it("should require authentication for protected procedures", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admissions.listApplications({})
    ).rejects.toThrow();
  });

  it("should allow authenticated users to access protected procedures", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admissions.listApplications({});
    expect(result).toBeDefined();
  });
});
