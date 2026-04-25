import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@school.com",
    name: "Test Admin",
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

describe("Phase 3: Student Profile Enhancements", () => {
  describe("Student Profile Editing", () => {
    it("should update student profile information", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.update({
        id: 1,
        firstName: "Updated",
        lastName: "Student",
        bloodGroup: "O+",
        address: "123 New Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });

      expect(result.success).toBe(true);
    });

    it("should update student class and section", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.update({
        id: 1,
        classId: 2,
        sectionId: 3,
        rollNo: "UKG-A-15",
      });

      expect(result.success).toBe(true);
    });

    it("should update student status", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.update({
        id: 1,
        status: "INACTIVE",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Document Management", () => {
    it("should add a document for a student", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.addDocument({
        studentId: 1,
        documentTypeId: 1,
        filePath: "https://example.com/birth-certificate.pdf",
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should retrieve all documents for a student", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const documents = await caller.students.getDocuments({ studentId: 1 });

      expect(Array.isArray(documents)).toBe(true);
      if (documents.length > 0) {
        expect(documents[0]).toHaveProperty("id");
        expect(documents[0]).toHaveProperty("documentTypeName");
        expect(documents[0]).toHaveProperty("filePath");
        expect(documents[0]).toHaveProperty("uploadedAt");
      }
    });

    it("should delete a document", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First add a document
      const added = await caller.students.addDocument({
        studentId: 1,
        documentTypeId: 2,
        filePath: "https://example.com/temp-doc.pdf",
      });

      // Then delete it
      const result = await caller.students.deleteDocument({ id: added.id });

      expect(result.success).toBe(true);
    });
  });

  describe("Fee and Invoice Management", () => {
    it("should retrieve student invoices", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const invoices = await caller.students.getInvoices({ studentId: 1 });

      expect(Array.isArray(invoices)).toBe(true);
      if (invoices.length > 0) {
        expect(invoices[0]).toHaveProperty("id");
        expect(invoices[0]).toHaveProperty("invoiceNo");
        expect(invoices[0]).toHaveProperty("totalAmount");
        expect(invoices[0]).toHaveProperty("amountPaid");
        expect(invoices[0]).toHaveProperty("status");
      }
    });

    it("should generate a new invoice for a student", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.generateInvoice({
        studentId: 1,
        feeStructureId: 1,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      expect(result.id).toBeDefined();
      expect(result.invoiceNo).toBeDefined();
      expect(result.totalAmount).toBeGreaterThan(0);
    });

    it("should retrieve student payment history", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const payments = await caller.students.getPayments({ studentId: 1 });

      expect(Array.isArray(payments)).toBe(true);
      if (payments.length > 0) {
        expect(payments[0]).toHaveProperty("id");
        expect(payments[0]).toHaveProperty("amountPaid");
        expect(payments[0]).toHaveProperty("paymentMode");
        expect(payments[0]).toHaveProperty("paymentDate");
      }
    });
  });

  describe("Parent Management", () => {
    it("should add a parent for a student", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.students.addParent({
        studentId: 1,
        relationship: "Father",
        firstName: "Test",
        lastName: "Parent",
        email: "parent@example.com",
        phone: "+91-9876543210",
        occupation: "Engineer",
        isPrimary: 1,
      });

      expect(result.id).toBeDefined();
    });

    it("should retrieve all parents for a student", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const parents = await caller.students.getParents({ studentId: 1 });

      expect(Array.isArray(parents)).toBe(true);
      if (parents.length > 0) {
        expect(parents[0]).toHaveProperty("id");
        expect(parents[0]).toHaveProperty("relationship");
        expect(parents[0]).toHaveProperty("firstName");
        expect(parents[0]).toHaveProperty("lastName");
        expect(parents[0]).toHaveProperty("phone");
      }
    });

    it("should add multiple parents with different relationships", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const father = await caller.students.addParent({
        studentId: 2,
        relationship: "Father",
        firstName: "John",
        lastName: "Doe",
        phone: "+91-9876543211",
        isPrimary: 1,
      });

      const mother = await caller.students.addParent({
        studentId: 2,
        relationship: "Mother",
        firstName: "Jane",
        lastName: "Doe",
        phone: "+91-9876543212",
        isPrimary: 0,
      });

      expect(father.id).toBeDefined();
      expect(mother.id).toBeDefined();

      const parents = await caller.students.getParents({ studentId: 2 });
      expect(parents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete student profile workflow", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Get student
      const student = await caller.students.getById({ id: 1 });
      expect(student).toBeDefined();

      // Update profile
      await caller.students.update({
        id: 1,
        address: "456 Test Avenue",
        city: "Delhi",
      });

      // Add document
      const doc = await caller.students.addDocument({
        studentId: 1,
        documentTypeId: 1,
        filePath: "https://example.com/test-doc.pdf",
      });
      expect(doc.id).toBeDefined();

      // Add parent
      const parent = await caller.students.addParent({
        studentId: 1,
        relationship: "Guardian",
        firstName: "Test",
        lastName: "Guardian",
        phone: "+91-9999999999",
      });
      expect(parent.id).toBeDefined();

      // Generate invoice
      const invoice = await caller.students.generateInvoice({
        studentId: 1,
        feeStructureId: 1,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      expect(invoice.id).toBeDefined();

      // Verify all data
      const documents = await caller.students.getDocuments({ studentId: 1 });
      const parents = await caller.students.getParents({ studentId: 1 });
      const invoices = await caller.students.getInvoices({ studentId: 1 });

      expect(documents.length).toBeGreaterThan(0);
      expect(parents.length).toBeGreaterThan(0);
      expect(invoices.length).toBeGreaterThan(0);
    });
  });
});
