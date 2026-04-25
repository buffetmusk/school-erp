/**
 * Automated Notification Service
 * 
 * This module handles automated notifications for various events:
 * - Attendance alerts
 * - Fee payment confirmations
 * - Fee due reminders
 * - Exam marks published
 * - Festival greetings
 */

import { sendMessage, formatPhoneNumber, replaceTemplateVariables } from "./sms";
import type { MessageResult } from "./sms";

export interface NotificationContext {
  studentName: string;
  parentName: string;
  parentPhone: string;
  className?: string;
  date?: string;
  amount?: number;
  invoiceNumber?: string;
  examName?: string;
  subject?: string;
  marks?: number;
  totalMarks?: number;
  percentage?: number;
  grade?: string;
  festivalName?: string;
}

/**
 * Send attendance absent alert to parent
 */
export async function sendAttendanceAlert(context: NotificationContext): Promise<MessageResult> {
  const message = replaceTemplateVariables(
    "Dear {parentName}, your child {studentName} ({className}) was marked absent on {date}. Please contact the school if this is an error.",
    {
      parentName: context.parentName,
      studentName: context.studentName,
      className: context.className || "",
      date: context.date || new Date().toLocaleDateString(),
    }
  );

  const phone = formatPhoneNumber(context.parentPhone);
  
  return sendMessage({
    to: phone,
    message,
    channel: "sms",
  });
}

/**
 * Send fee payment confirmation to parent
 */
export async function sendFeePaymentConfirmation(context: NotificationContext): Promise<MessageResult> {
  const message = replaceTemplateVariables(
    "Dear {parentName}, we have received your payment of ₹{amount} for {studentName}. Invoice: {invoiceNumber}. Thank you!",
    {
      parentName: context.parentName,
      studentName: context.studentName,
      amount: context.amount || 0,
      invoiceNumber: context.invoiceNumber || "",
    }
  );

  const phone = formatPhoneNumber(context.parentPhone);
  
  return sendMessage({
    to: phone,
    message,
    channel: "sms",
  });
}

/**
 * Send fee due reminder to parent
 */
export async function sendFeeDueReminder(context: NotificationContext): Promise<MessageResult> {
  const message = replaceTemplateVariables(
    "Dear {parentName}, this is a reminder that fee payment of ₹{amount} for {studentName} is due on {date}. Please pay at your earliest convenience.",
    {
      parentName: context.parentName,
      studentName: context.studentName,
      amount: context.amount || 0,
      date: context.date || "",
    }
  );

  const phone = formatPhoneNumber(context.parentPhone);
  
  return sendMessage({
    to: phone,
    message,
    channel: "sms",
  });
}

/**
 * Send exam marks notification to parent
 */
export async function sendMarksNotification(context: NotificationContext): Promise<MessageResult> {
  const message = replaceTemplateVariables(
    "Dear {parentName}, {studentName}'s {examName} results are now available. {subject}: {marks}/{totalMarks} ({percentage}%, Grade: {grade}). Check the portal for details.",
    {
      parentName: context.parentName,
      studentName: context.studentName,
      examName: context.examName || "",
      subject: context.subject || "",
      marks: context.marks || 0,
      totalMarks: context.totalMarks || 0,
      percentage: context.percentage || 0,
      grade: context.grade || "",
    }
  );

  const phone = formatPhoneNumber(context.parentPhone);
  
  return sendMessage({
    to: phone,
    message,
    channel: "sms",
  });
}

/**
 * Send festival greeting to parent
 */
export async function sendFestivalGreeting(context: NotificationContext): Promise<MessageResult> {
  const message = replaceTemplateVariables(
    "Dear {parentName}, wishing you and your family a very happy {festivalName}! May this festival bring joy and prosperity to your home. - School Management",
    {
      parentName: context.parentName,
      festivalName: context.festivalName || "",
    }
  );

  const phone = formatPhoneNumber(context.parentPhone);
  
  return sendMessage({
    to: phone,
    message,
    channel: "sms",
  });
}

/**
 * Send bulk notifications to all parents
 */
export async function sendBulkNotification(params: {
  message: string;
  channel: "sms" | "whatsapp";
  recipients: Array<{ name: string; phone: string }>;
}): Promise<{ total: number; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of params.recipients) {
    const phone = formatPhoneNumber(recipient.phone);
    const result = await sendMessage({
      to: phone,
      message: params.message,
      channel: params.channel,
    });

    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return {
    total: params.recipients.length,
    sent,
    failed,
  };
}

/**
 * Log notification to database
 */
export async function logNotification(params: {
  recipientType: "parent" | "student" | "staff";
  recipientId?: number;
  recipientPhone: string;
  recipientName?: string;
  channel: "sms" | "whatsapp";
  templateId?: number;
  content: string;
  sentBy: number;
  deliveryResult: MessageResult;
}) {
  try {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (!db) return;

    const { messages } = await import("../../drizzle/schema");
    
    const [result] = await db.insert(messages).values({
      recipientType: params.recipientType,
      recipientId: params.recipientId,
      recipientPhone: params.recipientPhone,
      recipientName: params.recipientName,
      channel: params.channel,
      templateId: params.templateId,
      content: params.content,
      status: params.deliveryResult.success ? "sent" : "failed",
      deliveryStatus: JSON.stringify(params.deliveryResult),
      sentBy: params.sentBy,
      sentAt: params.deliveryResult.success ? new Date() : undefined,
    });

    console.log(`[Notification] Logged message ${result.insertId} to ${params.recipientName}`);
  } catch (error) {
    console.error("[Notification] Failed to log notification:", error);
  }
}
