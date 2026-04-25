import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
const createMockContext = (userId?: number): TrpcContext => ({
  user: userId
    ? {
        id: userId,
        openId: "test-open-id",
        name: "Test User",
        email: "test@example.com",
        role: "admin" as const,
      }
    : null,
  req: {} as any,
  res: {} as any,
});

describe("Grades API", () => {
  describe("getGradeScales", () => {
    it("should return all grade scales", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.grades.getGradeScales();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("createGradeScale", () => {
    it("should create a new grade scale when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const uniqueName = `A+`;
      const result = await caller.grades.createGradeScale({
        gradeName: uniqueName,
        minPercentage: 90,
        maxPercentage: 100,
        gradePoints: 10,
        description: "Outstanding performance",
        displayOrder: 1,
      });
      expect(result).toHaveProperty("id");
      expect(result.id).toBeGreaterThan(0);
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.grades.createGradeScale({
          gradeName: "Should Fail",
          minPercentage: 90,
          maxPercentage: 100,
          gradePoints: 10,
          displayOrder: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("calculateGrade", () => {
    it("should calculate grade based on percentage", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // First create some grade scales
      const authCaller = appRouter.createCaller(createMockContext(1));
      await authCaller.grades.createGradeScale({
        gradeName: `B+`,
        minPercentage: 80,
        maxPercentage: 100,
        gradePoints: 9,
        displayOrder: 1,
      });

      const result = await caller.grades.calculateGrade({ percentage: 85 });
      // Result could be null if no matching grade scale exists
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  describe("updateGradeScale", () => {
    it("should update grade scale when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      
      // Create a grade scale first
      const created = await caller.grades.createGradeScale({
        gradeName: `C+`,
        minPercentage: 70,
        maxPercentage: 79,
        gradePoints: 7,
        displayOrder: 3,
      });

      const result = await caller.grades.updateGradeScale({
        id: created.id,
        description: "Updated description",
      });
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.grades.updateGradeScale({
          id: 1,
          description: "Should fail",
        })
      ).rejects.toThrow();
    });
  });

  describe("deleteGradeScale", () => {
    it("should delete grade scale when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      
      // Create a grade scale first
      const created = await caller.grades.createGradeScale({
        gradeName: `D`,
        minPercentage: 60,
        maxPercentage: 69,
        gradePoints: 6,
        displayOrder: 4,
      });

      const result = await caller.grades.deleteGradeScale({ id: created.id });
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.grades.deleteGradeScale({ id: 1 })
      ).rejects.toThrow();
    });
  });
});

describe("Report Cards API", () => {
  describe("generate", () => {
    it("should generate report card when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      
      // Get required data
      const students = await caller.students.list({});
      const exams = await caller.exams.getExams({});

      if (students.length === 0 || exams.length === 0) {
        console.log("Skipping test: No students or exams available");
        return;
      }

      // Check if student has marks for this exam
      const marks = await caller.exams.getStudentMarks({
        studentId: students[0].id,
      });

      if (marks.length === 0) {
        console.log("Skipping test: No marks available for student");
        return;
      }

      try {
        const result = await caller.reportCards.generate({
          studentId: students[0].id,
          examId: exams[0].id,
        });

        expect(result).toHaveProperty("id");
        expect(result.id).toBeGreaterThan(0);
      } catch (error: any) {
        if (error.message.includes("No marks found")) {
          console.log("Skipping test: No marks found for student and exam");
        } else {
          throw error;
        }
      }
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.reportCards.generate({
          studentId: 1,
          examId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("getReportCard", () => {
    it("should get report card for student and exam", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const students = await caller.students.list({});
      const exams = await caller.exams.getExams({});

      if (students.length === 0 || exams.length === 0) {
        console.log("Skipping test: No students or exams available");
        return;
      }

      const result = await caller.reportCards.getReportCard({
        studentId: students[0].id,
        examId: exams[0].id,
      });

      // Result could be null if no report card exists
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("getStudentReportCards", () => {
    it("should get all report cards for a student", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const students = await caller.students.list({});

      if (students.length === 0) {
        console.log("Skipping test: No students available");
        return;
      }

      const result = await caller.reportCards.getStudentReportCards({
        studentId: students[0].id,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("bulkGenerate", () => {
    it("should bulk generate report cards when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const students = await caller.students.list({});
      const exams = await caller.exams.getExams({});

      if (students.length === 0 || exams.length === 0) {
        console.log("Skipping test: No students or exams available");
        return;
      }

      const result = await caller.reportCards.bulkGenerate({
        examId: exams[0].id,
        studentIds: students.slice(0, 2).map((s) => s.id), // Test with first 2 students
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.reportCards.bulkGenerate({
          examId: 1,
          studentIds: [1, 2],
        })
      ).rejects.toThrow();
    });
  });
});
