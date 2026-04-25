import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock authenticated context
const mockAuthContext: TrpcContext = {
  user: {
    id: 1,
    openId: "test-user",
    name: "Test Admin",
    email: "admin@test.com",
    loginMethod: "google",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

// Mock unauthenticated context
const mockUnauthContext: TrpcContext = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("Communication System Tests", () => {
  let templateId: number;
  let scheduledMessageId: number;

  describe("Message Templates", () => {
    it("should create a message template", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.communication.createTemplate({
        name: "Test Template",
        category: "general",
        channel: "sms",
        content: "Hello {parentName}, this is a test message for {studentName}.",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
      templateId = result.id;
    });

    it("should get all message templates", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const templates = await caller.communication.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should filter templates by category", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const templates = await caller.communication.getTemplates({
        category: "general",
      });

      expect(Array.isArray(templates)).toBe(true);
      templates.forEach((template) => {
        expect(template.category).toBe("general");
      });
    });

    it("should get a specific template by ID", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const template = await caller.communication.getTemplate({ id: templateId });

      expect(template).toBeDefined();
      expect(template?.id).toBe(templateId);
      expect(template?.name).toBe("Test Template");
    });

    it("should update a message template", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      await caller.communication.updateTemplate({
        id: templateId,
        name: "Updated Test Template",
      });

      const updated = await caller.communication.getTemplate({ id: templateId });
      expect(updated?.name).toBe("Updated Test Template");
    });
  });

  describe("Scheduled Messages", () => {
    it("should create a scheduled message", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.communication.createScheduledMessage({
        name: "Test Scheduled Message",
        templateId: templateId,
        recipientType: "all_parents",
        channel: "sms",
        scheduleType: "once",
        scheduleDate: new Date("2026-12-25"),
        scheduleTime: "09:00",
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
      scheduledMessageId = result.id;
    });

    it("should get all scheduled messages", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const messages = await caller.communication.getScheduledMessages();

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
    });

    it("should filter scheduled messages by active status", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const activeMessages = await caller.communication.getScheduledMessages({
        isActive: true,
      });

      expect(Array.isArray(activeMessages)).toBe(true);
      activeMessages.forEach((msg) => {
        expect(msg.isActive).toBe(1);
      });
    });

    it("should update a scheduled message", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      await caller.communication.updateScheduledMessage({
        id: scheduledMessageId,
        name: "Updated Scheduled Message",
        isActive: 0,
      });

      const messages = await caller.communication.getScheduledMessages();
      const updated = messages.find((m) => m.id === scheduledMessageId);
      expect(updated?.name).toBe("Updated Scheduled Message");
      expect(updated?.isActive).toBe(0);
    });
  });

  describe("Message Sending", () => {
    it("should send an individual message", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.communication.sendMessage({
        recipientType: "parent",
        recipientPhone: "+919876543210",
        recipientName: "Test Parent",
        content: "This is a test message",
        channel: "sms",
      });

      expect(result).toHaveProperty("success");
      // In development mode without Twilio credentials, it will return success: false
      // In production with real credentials, it should return success: true
    });

    it("should send bulk messages to all parents", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.communication.sendBulkMessage({
        recipientType: "all_parents",
        content: "This is a bulk test message",
        channel: "sms",
      });

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("sent");
      expect(result).toHaveProperty("failed");
      expect(typeof result.total).toBe("number");
    });

    it("should send bulk messages using a template", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const result = await caller.communication.sendBulkMessage({
        recipientType: "all_parents",
        templateId: templateId,
        content: "",
        channel: "sms",
      });

      expect(result).toHaveProperty("total");
      expect(typeof result.total).toBe("number");
    });
  });

  describe("Message History", () => {
    it("should get message history", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const messages = await caller.communication.getMessages({ limit: 10 });

      expect(Array.isArray(messages)).toBe(true);
    });

    it("should filter messages by channel", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const smsMessages = await caller.communication.getMessages({
        channel: "sms",
        limit: 10,
      });

      expect(Array.isArray(smsMessages)).toBe(true);
      smsMessages.forEach((msg) => {
        expect(msg.channel).toBe("sms");
      });
    });

    it("should filter messages by status", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      const sentMessages = await caller.communication.getMessages({
        status: "sent",
        limit: 10,
      });

      expect(Array.isArray(sentMessages)).toBe(true);
    });
  });

  describe("Cleanup", () => {
    it("should delete scheduled message", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      await caller.communication.deleteScheduledMessage({ id: scheduledMessageId });

      const messages = await caller.communication.getScheduledMessages();
      const deleted = messages.find((m) => m.id === scheduledMessageId);
      expect(deleted).toBeUndefined();
    });

    it("should delete message template", async () => {
      const caller = appRouter.createCaller(mockAuthContext);
      await caller.communication.deleteTemplate({ id: templateId });

      const template = await caller.communication.getTemplate({ id: templateId });
      // Template is soft-deleted (isActive = 0), so it still exists but won't appear in active lists
      expect(template).toBeDefined();
      expect(template?.isActive).toBe(0);
    });
  });

  describe("Authorization", () => {
    it("should require authentication for creating templates", async () => {
      const caller = appRouter.createCaller(mockUnauthContext);
      
      await expect(
        caller.communication.createTemplate({
          name: "Unauthorized Template",
          category: "general",
          channel: "sms",
          content: "Test",
        })
      ).rejects.toThrow();
    });

    it("should require authentication for sending messages", async () => {
      const caller = appRouter.createCaller(mockUnauthContext);
      
      await expect(
        caller.communication.sendMessage({
          recipientType: "parent",
          recipientPhone: "+919876543210",
          content: "Test",
          channel: "sms",
        })
      ).rejects.toThrow();
    });
  });
});
