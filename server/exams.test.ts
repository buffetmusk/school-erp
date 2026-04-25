import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

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

describe("Exams API", () => {
  describe("getExamTypes", () => {
    it("should return all exam types", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.exams.getExamTypes();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("createExamType", () => {
    it("should create a new exam type when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const uniqueName = `Unit Test Exam ${Date.now()}`;
      const result = await caller.exams.createExamType({
        name: uniqueName,
        description: "Test for unit testing",
        weightage: 20,
      });
      expect(result).toHaveProperty("id");
      expect(result.id).toBeGreaterThan(0);
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.exams.createExamType({
          name: "Should Fail",
          weightage: 20,
        })
      ).rejects.toThrow();
    });
  });

  describe("createExam", () => {
    it("should create an exam with subjects when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      
      // First ensure we have required data
      const academicYears = await caller.masterData.academicYears();
      const classes = await caller.masterData.classes();
      const examTypes = await caller.exams.getExamTypes();
      const subjects = await caller.masterData.subjects();

      if (academicYears.length === 0 || classes.length === 0 || examTypes.length === 0 || subjects.length === 0) {
        console.log("Skipping test: Required master data not available");
        return;
      }

      const result = await caller.exams.createExam({
        name: "Mid-term Test 2024",
        examTypeId: examTypes[0].id,
        academicYearId: academicYears[0].id,
        classId: classes[0].id,
        startDate: "2024-03-01",
        endDate: "2024-03-10",
        totalMarks: 500,
        passingMarks: 200,
        subjects: [
          {
            subjectId: subjects[0].id,
            maxMarks: 100,
            passingMarks: 40,
            examDate: "2024-03-01",
          },
        ],
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBeGreaterThan(0);
    });
  });

  describe("getExams", () => {
    it("should return exams list", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.exams.getExams({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter exams by academicYearId", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const academicYears = await caller.masterData.academicYears();
      
      if (academicYears.length > 0) {
        const result = await caller.exams.getExams({
          academicYearId: academicYears[0].id,
        });
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe("enterMarks", () => {
    it("should allow marks entry when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      
      // Get required data
      const exams = await caller.exams.getExams({});
      const students = await caller.students.list({});

      if (exams.length === 0 || students.length === 0) {
        console.log("Skipping test: No exams or students available");
        return;
      }

      const exam = exams[0];
      const examDetails = await caller.exams.getExamById({ id: exam.id });
      
      if (!examDetails.subjects || examDetails.subjects.length === 0) {
        console.log("Skipping test: No subjects in exam");
        return;
      }

      const result = await caller.exams.enterMarks({
        studentId: students[0].id,
        examSubjectId: examDetails.subjects[0].id,
        marksObtained: 85,
        isAbsent: 0,
        remarks: "Good performance",
      });

      expect(result).toHaveProperty("id");
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.exams.enterMarks({
          studentId: 1,
          examSubjectId: 1,
          marksObtained: 85,
        })
      ).rejects.toThrow();
    });
  });

  describe("getPerformanceAnalytics", () => {
    it("should return performance analytics", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.exams.getPerformanceAnalytics({});
      expect(result).toHaveProperty("totalStudents");
      expect(result).toHaveProperty("totalExams");
      expect(result).toHaveProperty("averageMarks");
    });
  });

  describe("getSubjectWisePerformance", () => {
    it("should return subject-wise performance data", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.exams.getSubjectWisePerformance({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getTopPerformers", () => {
    it("should return top performers list", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.exams.getTopPerformers({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getStudentMarks", () => {
    it("should return marks for a specific student", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const students = await caller.students.list({});
      
      if (students.length > 0) {
        const result = await caller.exams.getStudentMarks({
          studentId: students[0].id,
        });
        expect(Array.isArray(result)).toBe(true);
      } else {
        console.log("Skipping test: No students available");
      }
    });
  });

  describe("updateExamStatus", () => {
    it("should update exam status when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));
      const exams = await caller.exams.getExams({});
      
      if (exams.length > 0) {
        const result = await caller.exams.updateExamStatus({
          id: exams[0].id,
          status: "ONGOING",
        });
        expect(result).toBeDefined();
      }
    });

    it("should fail when not authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext());
      await expect(
        caller.exams.updateExamStatus({
          id: 1,
          status: "COMPLETED",
        })
      ).rejects.toThrow();
    });
  });
});
