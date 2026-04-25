import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Parent Portal System", () => {
  let testStudentId: number;
  let testParentId: number;
  let testUserId: number;
  let testExamId: number;
  let testClassId: number;

  // Create authenticated context for parent user
  const parentCtx = {
    user: {
      id: 999,
      openId: "test-parent-openid",
      name: "Test Parent",
      email: "testparent@example.com",
      role: "parent" as const,
      loginMethod: "google" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };

  const adminCtx = {
    user: {
      id: 1,
      openId: "test-admin-openid",
      name: "Test Admin",
      email: "admin@example.com",
      role: "admin" as const,
      loginMethod: "google" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };

  beforeAll(async () => {
    // Create test data
    const academicYear = await db.createAcademicYear({
      name: "2026-2027-test-parent",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      isActive: true,
    });

    testClassId = await db.createClass({
      name: "Test Class Parent Portal",
      displayOrder: 1,
      isActive: true,
    });

    testStudentId = await db.createStudent({
      firstName: "Test",
      lastName: "Student",
      dateOfBirth: new Date("2015-01-01"),
      gender: "male",
      classId: testClassId,
      admissionDate: new Date(),
      studentNo: "TEST-PARENT-001",
      academicYearId: academicYear.id,
    });

    // Create parent record
    testParentId = await db.createParent({
      studentId: testStudentId,
      firstName: "Test",
      lastName: "Parent",
      relationship: "father",
      phone: "+919876543210",
      email: "testparent@example.com",
      isEmergencyContact: true,
    });

    // Create exam for testing
    const examType = await db.createExamType({ name: "Mid-term Test Parent" });
    testExamId = await db.createExam({
      name: "Mid-term Exam Parent Portal",
      examTypeId: examType.id,
      academicYearId: academicYear.id,
      classId: testClassId,
      startDate: new Date(),
      endDate: new Date(),
    });
  });

  describe("Parent Registration with OTP", () => {
    it("should send OTP to parent phone number", async () => {
      const caller = appRouter.createCaller({ user: null });
      
      const result = await caller.parentAuth.sendOTP({
        phone: "+919876543210",
        studentRollNumber: "TEST-PARENT-001",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("OTP sent");
    });

    it("should fail OTP send for invalid student roll number", async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.parentAuth.sendOTP({
          phone: "+919876543210",
          studentRollNumber: "INVALID-ROLL",
        })
      ).rejects.toThrow();
    });

    it("should verify OTP and register parent", async () => {
      const caller = appRouter.createCaller({ user: null });
      
      // First send OTP
      await caller.parentAuth.sendOTP({
        phone: "+919876543210",
        studentRollNumber: "TEST-PARENT-001",
      });

      // Get the OTP from database (in real scenario, parent receives via SMS)
      const otp = await db.getLatestOTP("+919876543210");
      expect(otp).toBeDefined();

      // Verify OTP and register
      const result = await caller.parentAuth.verifyOTPAndRegister({
        phone: "+919876543210",
        otp: otp!.otp,
        name: "Test Parent",
        email: "testparent@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      testUserId = result.userId!;
    });
  });

  describe("Parent Dashboard", () => {
    it("should get parent's children list", async () => {
      // Link parent to user account
      await db.linkParentToUser(testParentId, testUserId);

      const caller = appRouter.createCaller({ ...parentCtx, user: { ...parentCtx.user, id: testUserId } });
      
      const children = await caller.parentPortal.getMyChildren();

      expect(children).toBeDefined();
      expect(children.length).toBeGreaterThan(0);
      expect(children[0].firstName).toBe("Test");
      expect(children[0].lastName).toBe("Student");
    });

    it("should get child performance summary", async () => {
      const caller = appRouter.createCaller({ ...parentCtx, user: { ...parentCtx.user, id: testUserId } });
      
      const performance = await caller.parentPortal.getChildPerformance({
        studentId: testStudentId,
      });

      expect(performance).toBeDefined();
      expect(performance.studentId).toBe(testStudentId);
    });
  });

  describe("Attendance Management", () => {
    it("should mark attendance for students", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      const result = await caller.attendance.markAttendance({
        studentId: testStudentId,
        date: new Date().toISOString().split("T")[0],
        status: "present",
        markedBy: adminCtx.user.id,
      });

      expect(result.id).toBeDefined();
    });

    it("should get attendance records for a student", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      const records = await caller.attendance.getAttendance({
        studentId: testStudentId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });

      expect(records).toBeDefined();
      expect(Array.isArray(records)).toBe(true);
    });

    it("should calculate attendance statistics", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      const stats = await caller.attendance.getAttendanceStats({
        studentId: testStudentId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });

      expect(stats).toBeDefined();
      expect(stats.totalDays).toBeGreaterThanOrEqual(0);
      expect(stats.presentDays).toBeGreaterThanOrEqual(0);
      expect(stats.percentage).toBeGreaterThanOrEqual(0);
    });

    it("should support bulk attendance marking", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      const result = await caller.attendance.bulkMarkAttendance({
        classId: testClassId,
        date: new Date().toISOString().split("T")[0],
        attendanceData: [
          { studentId: testStudentId, status: "present" },
        ],
        markedBy: adminCtx.user.id,
      });

      expect(result.success).toBe(true);
      expect(result.marked).toBeGreaterThan(0);
    });
  });

  describe("Leave Applications", () => {
    it("should create leave application", async () => {
      const caller = appRouter.createCaller({ ...parentCtx, user: { ...parentCtx.user, id: testUserId } });
      
      const result = await caller.attendance.applyLeave({
        studentId: testStudentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: "Family function",
        appliedBy: testUserId,
      });

      expect(result.id).toBeDefined();
    });

    it("should approve leave application", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      // First create a leave application
      const leaveApp = await caller.attendance.applyLeave({
        studentId: testStudentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: "Medical",
        appliedBy: testUserId,
      });

      // Approve it
      const result = await caller.attendance.approveLeave({
        leaveId: leaveApp.id,
        approvedBy: adminCtx.user.id,
        remarks: "Approved",
      });

      expect(result.success).toBe(true);
    });

    it("should reject leave application", async () => {
      const caller = appRouter.createCaller(adminCtx);
      
      // First create a leave application
      const leaveApp = await caller.attendance.applyLeave({
        studentId: testStudentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: "Vacation",
        appliedBy: testUserId,
      });

      // Reject it
      const result = await caller.attendance.rejectLeave({
        leaveId: leaveApp.id,
        rejectedBy: adminCtx.user.id,
        remarks: "Too many leaves already taken",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Parent Notifications", () => {
    it("should get notifications for parent", async () => {
      const caller = appRouter.createCaller({ ...parentCtx, user: { ...parentCtx.user, id: testUserId } });
      
      const notifications = await caller.parentPortal.getNotifications({
        limit: 10,
      });

      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });
  });
});
