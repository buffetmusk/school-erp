/**
 * Role-Based Access Control (RBAC) System
 * 
 * This module provides middleware and utilities for managing permissions
 * across different user roles in the School ERP system.
 */

import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

export type UserRole = "admin" | "principal" | "teacher" | "accountant" | "parent" | "student";
export type ResourceAction = "create" | "read" | "update" | "delete" | "all";

/**
 * Permission matrix defining what each role can do
 * This is a simplified in-memory version. For production, load from database.
 */
const PERMISSION_MATRIX: Record<UserRole, Record<string, ResourceAction[]>> = {
  admin: {
    "*": ["all"], // Admin has full access to everything
  },
  principal: {
    students: ["create", "read", "update", "delete"],
    staff: ["create", "read", "update", "delete"],
    admissions: ["create", "read", "update", "delete"],
    fees: ["create", "read", "update", "delete"],
    exams: ["create", "read", "update", "delete"],
    marks: ["create", "read", "update", "delete"],
    reports: ["read"],
    communication: ["create", "read"],
    analytics: ["read"],
  },
  teacher: {
    students: ["read"],
    exams: ["read"],
    marks: ["create", "read", "update"], // Teachers can enter and update marks
    attendance: ["create", "read", "update"],
    communication: ["create", "read"], // Can send messages to parents
    reports: ["read"],
  },
  accountant: {
    students: ["read"],
    fees: ["create", "read", "update"],
    invoices: ["create", "read", "update"],
    payments: ["create", "read"],
    reports: ["read"],
    communication: ["create", "read"], // Can send fee reminders
  },
  parent: {
    students: ["read"], // Can only view their own children
    fees: ["read"], // Can view fee status
    exams: ["read"], // Can view exam schedule
    marks: ["read"], // Can view child's marks
    attendance: ["read"], // Can view child's attendance
    reportCards: ["read"], // Can download report cards
    communication: ["read"], // Can receive messages
  },
  student: {
    exams: ["read"], // Can view exam schedule
    marks: ["read"], // Can view own marks
    attendance: ["read"], // Can view own attendance
    reportCards: ["read"], // Can view own report cards
    fees: ["read"], // Can view fee status
    communication: ["read"], // Can receive messages
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: ResourceAction
): boolean {
  const rolePermissions = PERMISSION_MATRIX[userRole];
  
  if (!rolePermissions) {
    return false;
  }

  // Check for wildcard permission (admin)
  if (rolePermissions["*"]?.includes("all")) {
    return true;
  }

  // Check resource-specific permissions
  const resourcePermissions = rolePermissions[resource];
  
  if (!resourcePermissions) {
    return false;
  }

  // Check if user has "all" permission for this resource
  if (resourcePermissions.includes("all")) {
    return true;
  }

  // Check if user has the specific action permission
  return resourcePermissions.includes(action);
}

/**
 * Middleware to require authentication
 */
export function requireAuth(ctx: TrpcContext) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please login to access this resource",
    });
  }
  return ctx;
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (ctx: TrpcContext) => {
    requireAuth(ctx);
    
    const userRole = ctx.user!.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }
    
    return ctx;
  };
}

/**
 * Middleware to require permission for a resource action
 */
export function requirePermission(resource: string, action: ResourceAction) {
  return (ctx: TrpcContext) => {
    requireAuth(ctx);
    
    const userRole = ctx.user!.role as UserRole;
    
    if (!hasPermission(userRole, resource, action)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have permission to ${action} ${resource}`,
      });
    }
    
    return ctx;
  };
}

/**
 * Check if user is admin or principal
 */
export function isAdminOrPrincipal(ctx: TrpcContext): boolean {
  if (!ctx.user) return false;
  const role = ctx.user.role as UserRole;
  return role === "admin" || role === "principal";
}

/**
 * Check if user is staff (admin, principal, teacher, accountant)
 */
export function isStaff(ctx: TrpcContext): boolean {
  if (!ctx.user) return false;
  const role = ctx.user.role as UserRole;
  return ["admin", "principal", "teacher", "accountant"].includes(role);
}

/**
 * Get user's accessible resources based on role
 */
export function getAccessibleResources(userRole: UserRole): string[] {
  const permissions = PERMISSION_MATRIX[userRole];
  
  if (permissions["*"]) {
    return ["*"]; // Admin has access to everything
  }
  
  return Object.keys(permissions);
}

/**
 * Log audit trail for sensitive operations
 */
export async function logAudit(params: {
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const { getDb } = await import("../db");
    const db = await getDb();
    if (!db) return;

    const { auditLogs } = await import("../../drizzle/schema");
    
    await db.insert(auditLogs).values({
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    
    console.log(`[Audit] ${params.userName} (${params.userRole}) performed ${params.action} on ${params.resource}`);
  } catch (error) {
    console.error("[Audit] Failed to log audit trail:", error);
  }
}
