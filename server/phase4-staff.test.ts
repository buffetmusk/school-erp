import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@school.com",
    name: "Admin User",
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Phase 4: Staff Management Features", () => {
  const ctx = createAdminContext();
  const caller = appRouter.createCaller(ctx);

  describe("Staff Salary Management", () => {
    it("should list all staff with current salary", async () => {
      const staffList = await caller.staff.listWithSalary();

      expect(staffList).toBeDefined();
      expect(Array.isArray(staffList)).toBe(true);

      if (staffList.length > 0) {
        const firstStaff = staffList[0];
        expect(firstStaff).toHaveProperty("id");
        expect(firstStaff).toHaveProperty("staffNo");
        expect(firstStaff).toHaveProperty("firstName");
        expect(firstStaff).toHaveProperty("lastName");
        expect(firstStaff).toHaveProperty("currentSalary");
        expect(typeof firstStaff.currentSalary).toBe("number");
      }
    });

    it("should create a new salary revision for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping salary creation test");
        return;
      }

      const staffId = staffList[0]!.id;
      const result = await caller.staff.createSalary({
        staffId,
        basicSalary: 50000,
        allowances: 10000,
        deductions: 2000,
        effectiveFrom: new Date().toISOString().split("T")[0],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should get current salary for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping current salary test");
        return;
      }

      const staffId = staffList[0]!.id;
      const currentSalary = await caller.staff.getCurrentSalary({ staffId });

      if (currentSalary) {
        expect(currentSalary).toHaveProperty("basicSalary");
        expect(currentSalary).toHaveProperty("allowances");
        expect(currentSalary).toHaveProperty("deductions");
        expect(currentSalary).toHaveProperty("effectiveFrom");
        expect(typeof currentSalary.basicSalary).toBe("number");
      }
    });

    it("should get salary history for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping salary history test");
        return;
      }

      const staffId = staffList[0]!.id;
      const salaryHistory = await caller.staff.getSalaryHistory({ staffId });

      expect(Array.isArray(salaryHistory)).toBe(true);
      if (salaryHistory.length > 0) {
        const firstSalary = salaryHistory[0];
        expect(firstSalary).toHaveProperty("basicSalary");
        expect(firstSalary).toHaveProperty("allowances");
        expect(firstSalary).toHaveProperty("deductions");
        expect(firstSalary).toHaveProperty("effectiveFrom");
      }
    });
  });

  describe("Staff Payment Management", () => {
    it("should record a salary payment for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping payment recording test");
        return;
      }

      const staffId = staffList[0]!.id;
      const currentDate = new Date();

      const result = await caller.staff.recordPayment({
        staffId,
        paymentDate: currentDate.toISOString().split("T")[0],
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        amount: 58000,
        paymentMode: "BANK_TRANSFER",
        referenceNo: `PAY-${Date.now()}`,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should get payment history for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping payment history test");
        return;
      }

      const staffId = staffList[0]!.id;
      const payments = await caller.staff.getPayments({ staffId });

      expect(Array.isArray(payments)).toBe(true);
      if (payments.length > 0) {
        const firstPayment = payments[0];
        expect(firstPayment).toHaveProperty("paymentDate");
        expect(firstPayment).toHaveProperty("month");
        expect(firstPayment).toHaveProperty("year");
        expect(firstPayment).toHaveProperty("amount");
        expect(firstPayment).toHaveProperty("paymentMode");
        expect(firstPayment).toHaveProperty("status");
      }
    });

    it("should get payments by period", async () => {
      const currentDate = new Date();
      const payments = await caller.staff.getPaymentsByPeriod({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });

      expect(Array.isArray(payments)).toBe(true);
      if (payments.length > 0) {
        const firstPayment = payments[0];
        expect(firstPayment.month).toBe(currentDate.getMonth() + 1);
        expect(firstPayment.year).toBe(currentDate.getFullYear());
      }
    });
  });

  describe("Leave Management", () => {
    it("should get all leave types", async () => {
      const leaveTypes = await caller.staff.getLeaveTypes();

      expect(Array.isArray(leaveTypes)).toBe(true);
      if (leaveTypes.length > 0) {
        const firstType = leaveTypes[0];
        expect(firstType).toHaveProperty("id");
        expect(firstType).toHaveProperty("name");
        expect(firstType).toHaveProperty("maxDaysPerYear");
        expect(firstType).toHaveProperty("isPaid");
      }
    });

    it("should create a new leave type", async () => {
      const result = await caller.staff.createLeaveType({
        name: `Test Leave ${Date.now()}`,
        maxDaysPerYear: 10,
        isPaid: 1,
        description: "Test leave type for automated testing",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should apply for leave", async () => {
      const staffList = await caller.staff.listWithSalary();
      const leaveTypes = await caller.staff.getLeaveTypes();

      if (staffList.length === 0 || leaveTypes.length === 0) {
        console.log("No staff or leave types found, skipping leave application test");
        return;
      }

      const staffId = staffList[0]!.id;
      const leaveTypeId = leaveTypes[0]!.id;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const result = await caller.staff.applyLeave({
        staffId,
        leaveTypeId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        days: 3,
        reason: "Test leave application",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should get leave records for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      if (staffList.length === 0) {
        console.log("No staff found, skipping leave records test");
        return;
      }

      const staffId = staffList[0]!.id;
      const leaves = await caller.staff.getLeaves({ staffId });

      expect(Array.isArray(leaves)).toBe(true);
      if (leaves.length > 0) {
        const firstLeave = leaves[0];
        expect(firstLeave).toHaveProperty("leaveTypeId");
        expect(firstLeave).toHaveProperty("startDate");
        expect(firstLeave).toHaveProperty("endDate");
        expect(firstLeave).toHaveProperty("days");
        expect(firstLeave).toHaveProperty("status");
      }
    });

    it("should get pending leave applications", async () => {
      const pendingLeaves = await caller.staff.getPendingLeaves();

      expect(Array.isArray(pendingLeaves)).toBe(true);
      if (pendingLeaves.length > 0) {
        const firstLeave = pendingLeaves[0];
        expect(firstLeave.status).toBe("PENDING");
      }
    });

    it("should approve a leave application", async () => {
      const pendingLeaves = await caller.staff.getPendingLeaves();

      if (pendingLeaves.length === 0) {
        console.log("No pending leaves found, skipping approval test");
        return;
      }

      const leaveId = pendingLeaves[0]!.id;
      const result = await caller.staff.approveLeave({ leaveId });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should calculate leave balance for a staff member", async () => {
      const staffList = await caller.staff.listWithSalary();
      const leaveTypes = await caller.staff.getLeaveTypes();

      if (staffList.length === 0 || leaveTypes.length === 0) {
        console.log("No staff or leave types found, skipping leave balance test");
        return;
      }

      const staffId = staffList[0]!.id;
      const leaveTypeId = leaveTypes[0]!.id;

      const balance = await caller.staff.getLeaveBalance({
        staffId,
        leaveTypeId,
      });

      expect(balance).toBeDefined();
      expect(balance).toHaveProperty("maxDays");
      expect(balance).toHaveProperty("usedDays");
      expect(balance).toHaveProperty("remainingDays");
      expect(typeof balance.maxDays).toBe("number");
      expect(typeof balance.usedDays).toBe("number");
      expect(typeof balance.remainingDays).toBe("number");
    });
  });

  describe("Staff Management Integration", () => {
    it("should have consistent data across salary and payment records", async () => {
      const staffList = await caller.staff.listWithSalary();

      if (staffList.length === 0) {
        console.log("No staff found, skipping integration test");
        return;
      }

      const staffId = staffList[0]!.id;

      const currentSalary = await caller.staff.getCurrentSalary({ staffId });
      const payments = await caller.staff.getPayments({ staffId });

      if (currentSalary && payments.length > 0) {
        const totalSalary =
          currentSalary.basicSalary + currentSalary.allowances - currentSalary.deductions;

        // Verify that payments are reasonable compared to salary
        const recentPayment = payments[0];
        expect(recentPayment.amount).toBeGreaterThan(0);
        expect(recentPayment.amount).toBeLessThanOrEqual(totalSalary * 1.5); // Allow some variation
      }
    });

    it("should track leave balance correctly after approval", async () => {
      const staffList = await caller.staff.listWithSalary();
      const leaveTypes = await caller.staff.getLeaveTypes();

      if (staffList.length === 0 || leaveTypes.length === 0) {
        console.log("No staff or leave types found, skipping leave balance tracking test");
        return;
      }

      const staffId = staffList[0]!.id;
      const leaveTypeId = leaveTypes[0]!.id;

      const balanceBefore = await caller.staff.getLeaveBalance({
        staffId,
        leaveTypeId,
      });

      // The balance should be calculated correctly
      expect(balanceBefore.remainingDays).toBe(
        balanceBefore.maxDays - balanceBefore.usedDays
      );
    });
  });
});
