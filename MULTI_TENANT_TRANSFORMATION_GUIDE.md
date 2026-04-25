# Multi-Tenant SaaS Transformation Guide

## 🎯 Overview

This guide documents the transformation of the School ERP from a single-school system to a multi-tenant SaaS platform where multiple schools can use the same platform with complete data isolation.

## ✅ What's Complete

### 1. Database Schema (100% Complete)
- ✅ Added `organizations` table with subscription plans
- ✅ Added `organization_users` table for user-organization mapping
- ✅ Added `organization_invitations` table for onboarding
- ✅ Added `organizationId` field to all 37 data tables
- ✅ Added `isSuperAdmin` flag to users table
- ✅ Created default organization (ID: 1) and migrated all existing data

### 2. Organization Context Middleware (100% Complete)
- ✅ Created `/server/_core/organizationContext.ts`
- ✅ `getOrganizationContext(userId)` - Gets user's organization
- ✅ `withOrganizationContext(userId)` - Middleware for tRPC
- ✅ `getOrgFilter(context)` - Helper for query filtering
- ✅ `validateOrganizationAccess()` - Access control validation
- ✅ Super admin bypass logic (organizationId = 0 means "all organizations")

### 3. Seed Data (100% Complete)
- ✅ All seed data inserts now include `organizationId: 1`
- ✅ Ready for testing with clean multi-tenant data

## 🚧 What Remains

### 1. Update db.ts Functions (~200 functions)
**Status:** 0% Complete

Every function in `server/db.ts` needs to be updated to:
1. Accept `organizationId: number` parameter
2. Add organization filtering to WHERE clauses
3. Include organizationId in INSERT/UPDATE operations
4. Handle super admin case (organizationId = 0 = no filter)

### 2. Update tRPC Context
**Status:** Not Started

File: `server/_core/context.ts`

Add organization context to tRPC context so all procedures have access to it.

### 3. Update routers.ts (~100 endpoints)
**Status:** 0% Complete

Every tRPC procedure needs to:
1. Get organization context from `ctx`
2. Pass organizationId to db functions
3. Validate organization access for sensitive operations

### 4. Build Super Admin UI
**Status:** Not Started

Create admin panel for:
- View all schools
- Create new school/organization
- Manage school status (active, suspended, trial)
- Generate unique access links
- View analytics per school

### 5. Build Organization Management UI
**Status:** Not Started

Create UI for school admins:
- Organization settings
- User invitation system
- Manage organization users
- Branding and customization

---

## 📖 Transformation Patterns

### Pattern 1: Simple SELECT Query

**Before:**
```typescript
export async function getClasses() {
  const db = await getDb();
  if (!db) return [];
  const { classes } = await import("../drizzle/schema");
  return db.select().from(classes).where(eq(classes.isActive, 1));
}
```

**After:**
```typescript
export async function getClasses(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { classes } = await import("../drizzle/schema");
  
  // Super admin sees all organizations
  if (organizationId === 0) {
    return db.select().from(classes).where(eq(classes.isActive, 1));
  }
  
  // Regular users see only their organization
  return db.select().from(classes).where(
    and(
      eq(classes.organizationId, organizationId),
      eq(classes.isActive, 1)
    )
  );
}
```

### Pattern 2: INSERT Operation

**Before:**
```typescript
export async function createClass(data: { name: string; displayOrder: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { classes } = await import("../drizzle/schema");
  
  const result = await db.insert(classes).values({
    name: data.name,
    displayOrder: data.displayOrder,
    isActive: 1
  });
  
  return { id: Number(result.insertId) };
}
```

**After:**
```typescript
export async function createClass(
  organizationId: number,
  data: { name: string; displayOrder: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { classes } = await import("../drizzle/schema");
  
  const result = await db.insert(classes).values({
    organizationId,  // ← Add this
    name: data.name,
    displayOrder: data.displayOrder,
    isActive: 1
  });
  
  return { id: Number(result.insertId) };
}
```

### Pattern 3: UPDATE Operation

**Before:**
```typescript
export async function updateStudent(studentId: number, data: Partial<Student>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { students } = await import("../drizzle/schema");
  
  await db.update(students)
    .set(data)
    .where(eq(students.id, studentId));
}
```

**After:**
```typescript
export async function updateStudent(
  organizationId: number,
  studentId: number,
  data: Partial<Student>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { students } = await import("../drizzle/schema");
  
  // Super admin can update any student
  if (organizationId === 0) {
    await db.update(students)
      .set(data)
      .where(eq(students.id, studentId));
    return;
  }
  
  // Regular users can only update students in their organization
  await db.update(students)
    .set(data)
    .where(
      and(
        eq(students.id, studentId),
        eq(students.organizationId, organizationId)
      )
    );
}
```

### Pattern 4: Complex Query with JOINs

**Before:**
```typescript
export async function getStudentWithParents(studentId: number) {
  const db = await getDb();
  if (!db) return null;
  const { students, studentParents } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(students)
    .leftJoin(studentParents, eq(students.id, studentParents.studentId))
    .where(eq(students.id, studentId))
    .limit(1);
    
  return result[0] || null;
}
```

**After:**
```typescript
export async function getStudentWithParents(
  organizationId: number,
  studentId: number
) {
  const db = await getDb();
  if (!db) return null;
  const { students, studentParents } = await import("../drizzle/schema");
  
  // Build where clause based on organization
  const whereClause = organizationId === 0
    ? eq(students.id, studentId)
    : and(
        eq(students.id, studentId),
        eq(students.organizationId, organizationId)
      );
  
  const result = await db
    .select()
    .from(students)
    .leftJoin(studentParents, eq(students.id, studentParents.studentId))
    .where(whereClause)
    .limit(1);
    
  return result[0] || null;
}
```

---

## 🔧 tRPC Context Update

### Update `server/_core/context.ts`

Add organization context to the context builder:

```typescript
import { withOrganizationContext } from "./organizationContext";

export async function createContext(opts: CreateHTTPContextOptions) {
  const session = await getSession(opts.req);
  
  let orgContext = null;
  if (session?.user) {
    try {
      orgContext = await withOrganizationContext(session.user.id);
    } catch (error) {
      console.error("[Context] Failed to get organization context:", error);
    }
  }
  
  return {
    user: session?.user || null,
    organizationId: orgContext?.organizationId || null,
    isSuperAdmin: orgContext?.isSuperAdmin || false,
  };
}
```

---

## 🔧 Router Update Pattern

### Update `server/routers.ts`

**Before:**
```typescript
students: {
  list: protectedProcedure
    .input(z.object({ classId: z.number().optional() }))
    .query(async ({ input }) => {
      return getStudents(input.classId);
    }),
}
```

**After:**
```typescript
students: {
  list: protectedProcedure
    .input(z.object({ classId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const organizationId = ctx.isSuperAdmin ? 0 : ctx.organizationId!;
      return getStudents(organizationId, input.classId);
    }),
}
```

---

## 📋 Transformation Checklist

### Phase 1: Core Functions (High Priority)
- [ ] Update all functions in `getAcademicYears` through `getClasses` section
- [ ] Update all student-related functions
- [ ] Update all fee-related functions
- [ ] Update all exam-related functions
- [ ] Update all staff-related functions

### Phase 2: Context & Routers
- [ ] Update `server/_core/context.ts` to inject organization context
- [ ] Update all routers in `server/routers.ts` to pass organizationId

### Phase 3: Secondary Functions
- [ ] Update admission-related functions
- [ ] Update attendance functions
- [ ] Update communication functions
- [ ] Update report card functions

### Phase 4: Super Admin Features
- [ ] Create super admin dashboard
- [ ] Create organization management UI
- [ ] Create user invitation system
- [ ] Add organization settings page

### Phase 5: Testing
- [ ] Test data isolation between organizations
- [ ] Test super admin access to all organizations
- [ ] Test organization switching
- [ ] Update all test files

---

## 🚀 Quick Start Commands

```bash
# 1. Verify database migration
cd /home/ubuntu/school_erp_admissions_fees
pnpm db:push

# 2. Check organization data
# Use Database UI in Management Panel

# 3. Run seed with new organization data
pnpm seed

# 4. Start dev server
pnpm dev
```

---

## 📊 Progress Tracking

| Component | Functions | Complete | Remaining |
|-----------|-----------|----------|-----------|
| db.ts | ~200 | 0 | 200 |
| routers.ts | ~100 | 0 | 100 |
| context.ts | 1 | 0 | 1 |
| Super Admin UI | 5 pages | 0 | 5 |
| Org Management UI | 3 pages | 0 | 3 |
| Tests | ~50 | 0 | 50 |

**Total Estimated Time:** 15-20 hours of systematic work

---

## 💡 Tips

1. **Work in batches** - Update 10-20 functions at a time, test, then continue
2. **Test frequently** - Run the app after each batch to catch errors early
3. **Use TypeScript** - Let the compiler guide you to missing parameters
4. **Super admin first** - Build super admin UI early to test cross-organization access
5. **Document as you go** - Update this guide with any patterns you discover

---

## 🆘 Common Issues

### Issue: "User is not associated with any organization"
**Solution:** User needs to be added to `organization_users` table

```sql
INSERT INTO organization_users (organization_id, user_id, role, is_active)
VALUES (1, <user_id>, 'admin', 1);
```

### Issue: TypeScript errors about missing organizationId
**Solution:** This is expected. Update functions one by one following the patterns above.

### Issue: Data showing from wrong organization
**Solution:** Check that organizationId filter is applied in both:
1. The db.ts function
2. The router passing the correct organizationId

---

## 📞 Next Steps

1. **Immediate:** Update context.ts to inject organization context
2. **Short-term:** Transform db.ts functions in batches (start with students/fees)
3. **Medium-term:** Build super admin UI
4. **Long-term:** Add organization branding and customization

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Status:** Foundation Complete, Code Transformation Pending
