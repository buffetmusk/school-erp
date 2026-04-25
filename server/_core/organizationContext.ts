/**
 * Organization Context Middleware
 * Provides organization-scoped access control for multi-tenant architecture
 */

import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { organizationUsers, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface OrganizationContext {
  organizationId: number;
  isSuperAdmin: boolean;
}

/**
 * Get organization context for a user
 * Returns organizationId and super admin status
 */
export async function getOrganizationContext(userId: number): Promise<OrganizationContext> {
  // Check if user is super admin
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user || user.length === 0) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found",
    });
  }

  const isSuperAdmin = user[0].isSuperAdmin === 1;

  // Super admins don't need organization context (can access all)
  if (isSuperAdmin) {
    return {
      organizationId: 0, // 0 means "all organizations"
      isSuperAdmin: true,
    };
  }

  // Get user's organization from organization_users table
  const orgUser = await db
    .select()
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.isActive, 1)
      )
    )
    .limit(1);

  if (!orgUser || orgUser.length === 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User is not associated with any organization. Please contact your administrator.",
    });
  }

  return {
    organizationId: orgUser[0].organizationId,
    isSuperAdmin: false,
  };
}

/**
 * Middleware to inject organization context into tRPC context
 * Use this in protected procedures that need organization scoping
 */
export async function withOrganizationContext(userId: number) {
  const orgContext = await getOrganizationContext(userId);
  return orgContext;
}

/**
 * Helper to build organization filter for queries
 * Returns the organizationId to filter by, or null if super admin (no filter needed)
 */
export function getOrgFilter(context: OrganizationContext): number | null {
  return context.isSuperAdmin ? null : context.organizationId;
}

/**
 * Validate that a user has access to a specific organization
 * Throws error if user doesn't have access
 */
export async function validateOrganizationAccess(
  userId: number,
  organizationId: number
): Promise<void> {
  const context = await getOrganizationContext(userId);

  // Super admins can access any organization
  if (context.isSuperAdmin) {
    return;
  }

  // Check if user's organization matches requested organization
  if (context.organizationId !== organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this organization",
    });
  }
}
