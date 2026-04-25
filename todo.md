# School ERP - Admissions & Fees Module TODO

## Database & Backend
- [x] Create database schema for master data tables (academic years, classes, fee heads, document types)
- [x] Create database schema for admissions tables (applications, documents, status history)
- [x] Create database schema for fees tables (structures, components, invoices, invoice items, payments)
- [x] Implement database query helpers for admissions
- [x] Implement database query helpers for fees
- [x] Seed sample master data (academic years, classes, fee heads, document types)
- [x] Seed sample transactional data (applications, fee structures, invoices, payments)

## API & Authentication
- [x] Implement RBAC middleware for permission enforcement
- [x] Build tRPC procedures for admissions: create application
- [x] Build tRPC procedures for admissions: list applications with filters
- [x] Build tRPC procedures for admissions: get application details
- [x] Build tRPC procedures for admissions: update application status
- [x] Build tRPC procedures for fees: create fee structure
- [x] Build tRPC procedures for fees: list fee structures
- [x] Build tRPC procedures for fees: get fee structure details
- [ ] Build tRPC procedures for fees: generate invoices
- [x] Build tRPC procedures for fees: list invoices with filters
- [x] Build tRPC procedures for fees: record payment

## Frontend - Dashboard & Navigation
- [x] Design admin dashboard layout with sidebar navigation
- [x] Implement navigation structure for admissions and fees modules
- [x] Create dashboard home page with key metrics

## Frontend - Admissions Management
- [x] Build applications list page with filters
- [x] Build create application form
- [x] Build application details page
- [x] Build application status update functionality

## Frontend - Fees Management
- [x] Build fee structures list page
- [x] Build create fee structure form with components
- [x] Build invoices list page
- [x] Build payment recording functionality
- [x] Build dues tracking and reporting

## Testing & Deployment
- [x] Test all admissions workflows
- [x] Test all fees workflows
- [x] Test RBAC enforcement
- [x] Verify all sample data is properly seeded
- [x] Create initial checkpoint
- [ ] Deploy to production

## Phase 2: Enhanced Features

### Master Data Management (Editable)
- [x] Extend database schema with sections, subjects, staff tables
- [x] Build CRUD APIs for academic years management
- [x] Build CRUD APIs for classes and sections management
- [x] Build CRUD APIs for fee heads management
- [x] Build CRUD APIs for subjects management
- [x] Build CRUD APIs for document types management
- [ ] Create master data edit/create UI pages
- [ ] Add validation and conflict checking

### Student Management Module
- [x] Extend database schema for complete student profiles
- [x] Build API for student enrollment from approved applications
- [x] Build API for student profile management (CRUD)
- [x] Build API for class/section assignment
- [x] Build API for parent/guardian management
- [ ] Build API for student document management
- [ ] Build API for student status management (active/inactive/transferred)
- [x] Create student list page with advanced filters
- [x] Create student profile page with all details
- [x] Create student enrollment workflow UI
- [ ] Create bulk student operations UI

### Director Dashboard & Analytics
- [x] Build API for enrollment analytics (trends, class-wise breakdown)
- [x] Build API for financial analytics (collection, pending, projections)
- [x] Build API for application pipeline analytics
- [x] Build API for student demographics analytics
- [x] Create enhanced director dashboard with charts
- [x] Add real-time metrics and KPIs
- [ ] Add export functionality for reports

### Smart Automation Features
- [ ] Implement auto-enrollment workflow (application approval → student creation)
- [ ] Implement auto-invoice generation on enrollment
- [ ] Add fee reminder notifications
- [ ] Add application status change notifications
- [ ] Implement bulk invoice generation for classes
- [ ] Add academic year transition workflow
- [ ] Add fee defaulter alerts

### Communication & Notifications
- [ ] Build notification system for admins
- [ ] Build announcement system
- [ ] Add email notification templates
- [ ] Add SMS notification integration (placeholder)
- [ ] Create notifications UI page

### Testing & Deployment
- [ ] Write tests for master data CRUD operations
- [ ] Write tests for student management workflows
- [ ] Write tests for automation features
- [ ] Test all new UI pages
- [ ] Create final checkpoint with all enhancements


## Phase 3: Enhanced Student Profile Management

### Student Profile Enhancements
- [x] Make student profile fully editable (all fields)
- [x] Add document management section in student profile
- [x] Add document upload functionality
- [x] Add document download/view functionality
- [x] Add fee history section showing all invoices
- [x] Add payment history section showing all payments
- [x] Add ability to generate new invoice from student profile
- [ ] Add ability to record payment from student profile
- [x] Add parent/guardian management in student profile
- [x] Create tabbed interface for profile sections (Details, Documents, Fees, Payments, Parents)

### API Enhancements
- [x] Add database helpers for student document management
- [x] Add database helpers for student invoices and payments
- [x] Add database helper for generating student invoice
- [x] Build tRPC API for student document upload
- [x] Build tRPC API for student document listing
- [x] Build tRPC API for getting student fee invoices
- [x] Build tRPC API for getting student payment history
- [x] Build tRPC API for generating invoice for specific student
- [x] Build tRPC API for getting student parents

### Testing
- [x] Test profile editing functionality
- [x] Test document upload and management
- [x] Test fee and payment views in profile
- [x] Create checkpoint with all enhancements


## Bug Fixes
- [x] Add missing masterData.sections API endpoint
- [x] Test student profile page loads correctly
- [x] Create checkpoint with fix


## Phase 4: Enhanced Staff Management & HRMS

### Database Schema
- [x] Add staff_salaries table (staff_id, basic_salary, allowances, deductions, effective_from)
- [x] Add staff_payments table (staff_id, payment_date, month, year, amount, payment_mode, reference_no, status)
- [x] Add staff_leaves table (staff_id, leave_type, start_date, end_date, days, reason, status, approved_by)
- [x] Add leave_types table (name, max_days_per_year, is_paid, description)

### API Development
- [x] Build CRUD APIs for staff salary management
- [x] Build API for staff payment recording and history
- [x] Build CRUD APIs for leave types management
- [x] Build API for leave application submission
- [x] Build API for leave approval/rejection
- [x] Build API for staff leave balance calculation
- [x] Build API for staff payment summary and analytics

### Frontend - Staff Management
- [ ] Create staff list page with filters (department, role, status)
- [ ] Create staff profile page with tabbed interface
- [ ] Add salary management section in staff profile
- [ ] Add payment history section in staff profile
- [ ] Add leave history section in staff profile
- [ ] Add leave application functionality
- [ ] Add leave approval workflow for admins
- [ ] Create staff payment recording interface
- [ ] Create staff analytics dashboard (total salary, pending payments, leave summary)

### Testing
- [ ] Write unit tests for staff salary APIs
- [ ] Write unit tests for staff payment APIs
- [ ] Write unit tests for leave management APIs
- [ ] Run all tests and ensure they pass
- [ ] Create checkpoint with staff management enhancements


## Phase 4: Staff Management - COMPLETED ✓

### Database Schema - COMPLETED
- [x] Add staff_salaries table (staff_id, basic_salary, allowances, deductions, effective_from)
- [x] Add staff_payments table (staff_id, payment_date, month, year, amount, payment_mode, reference_no, status)
- [x] Add staff_leaves table (staff_id, leave_type, start_date, end_date, days, reason, status, approved_by)
- [x] Add leave_types table (name, max_days_per_year, is_paid, description)

### API Development - COMPLETED
- [x] Build CRUD APIs for staff salary management
- [x] Build API for staff payment recording and history
- [x] Build CRUD APIs for leave types management
- [x] Build API for leave application submission
- [x] Build API for leave approval/rejection
- [x] Build API for staff leave balance calculation
- [x] Build API for staff payment summary and analytics

### Frontend - Staff Management - COMPLETED
- [x] Create staff list page with filters (department, role, status)
- [x] Create staff profile page with tabbed interface
- [x] Add salary management section with history
- [x] Add payment recording and history section
- [x] Add leave management section with application and approval
- [x] Add navigation link for staff management in sidebar

### Testing - COMPLETED
- [x] Write comprehensive tests for staff salary management (16 tests)
- [x] Write tests for payment tracking and history
- [x] Write tests for leave management workflows
- [x] Write integration tests for staff management
- [x] All 71 tests passing


## Bug Fixes - Staff Profile
- [x] Make staff list rows clickable to navigate to staff profile
- [x] Create comprehensive staff profile page with tabbed interface
- [x] Add editable staff details section
- [x] Add salary history display with current salary
- [x] Add payment history with filtering by month/year
- [x] Add leave records display with status
- [x] Test staff profile navigation and all features
- [x] Create checkpoint with fixes


## Bug Fix - Master Data API Error
- [ ] Identify which API call is failing on Master Data page
- [ ] Add missing API endpoints
- [ ] Test Master Data page loads correctly
- [ ] Create checkpoint with fix


## Phase 5: Academic Performance Tracking System

### Database Schema
- [x] Create exam_types table (Unit Test, Mid-term, Final, etc.)
- [x] Create exams table (exam name, type, academic year, class, date, max marks)
- [x] Create exam_subjects table (link exams to subjects with max marks per subject)
- [x] Create student_marks table (student, exam, subject, marks obtained, remarks)

### Backend API
- [x] Exam types CRUD endpoints
- [x] Exams CRUD endpoints
- [x] Exam subjects management endpoints
- [x] Marks entry and update endpoints
- [x] Analytics endpoints (subject-wise, test-wise, student-wise performance)
- [x] Grade calculation and ranking logic

### Frontend - Exam Management
- [x] Exam types management page
- [x] Exams list page with filters
- [x] Create/edit exam form
- [x] Exam subjects configuration
- [x] Marks entry interface (class-wise, subject-wise)
- [ ] Bulk marks import functionality

### Frontend - Analytics & Dashboards
- [x] Academic performance dashboard (overall metrics)
- [x] Subject-wise performance analytics with charts
- [x] Test-wise performance comparison
- [ ] Class-wise performance comparison
- [x] Top performers list
- [ ] Student performance trends over time

### Student Profile Integration
- [x] Add "Academic Performance" tab to student profile
- [x] Show all exam results for the student
- [x] Subject-wise performance chart
- [ ] Progress tracking across academic year
- [ ] Grade history and trends

### Testing
- [x] Unit tests for exam management APIs
- [x] Unit tests for marks entry and analytics
- [x] Integration tests for performance calculations


## Bug Fixes
- [x] Fix TypeError in Performance Analytics - averageMarks.toFixed is not a function

## Phase 6: Grade Calculation & Report Cards
### Database Schema
- [x] Create grade_scales table (grade name, min percentage, max percentage, grade points)
- [x] Add grade field to student_marks table
- [x] Create report_cards table (student, exam, generated date, PDF URL)

### Backend API
- [x] Grade scale CRUD endpoints
- [x] Auto-calculate grade based on percentage
- [x] Report card generation endpoint (PDF)
- [x] Get report card by student and exam

### Frontend - Grade Management
- [x] Grade scale configuration page
- [ ] Auto-grade calculation on marks entry

### Frontend - Report Cards
- [x] Report card generation UI
- [x] Report card preview
- [x] Download report card as PDF
- [x] Bulk report card generation

### Testing
- [x] Unit tests for grade calculation logic
- [x] Unit tests for report card generation


## Phase 7: Role-Based Access Control & Communication Engine

### Database Schema
- [x] Extend user roles (add Parent, Student roles)
- [x] Create permissions table for granular access control
- [ ] Create role_permissions mapping table
- [x] Create message_templates table (SMS/WhatsApp templates)
- [x] Create messages table (sent message history)
- [x] Create scheduled_messages table (festival wishes, reminders)
- [x] Add phone number fields to students and parents tables

### Backend API - Role System
- [x] Permission middleware for protecting endpoints
- [ ] Role assignment and management endpoints
- [ ] User invitation system with role-based access
- [x] Audit logging for sensitive operations

### Backend API - Communication System
- [x] SMS API integration (Twilio)
- [x] WhatsApp API integration
- [x] Message template CRUD endpoints
- [x] Send individual message endpoint
- [x] Bulk message sending endpoint
- [x] Scheduled message management
- [x] Message history and delivery tracking

### Automated Notifications
- [ ] Daily attendance absent alerts to parents
- [x] Fee payment confirmation messages
- [ ] Fee due reminder notifications (configurable)
- [ ] Exam marks published notifications
- [x] Festival greeting scheduler

### Frontend - Role Management
- [ ] Role management page (assign roles to users)
- [ ] Permission configuration UI
- [ ] User invitation interface

### Frontend - Communication Center
- [x] Message templates management page
- [x] Send message interface (individual & bulk)
- [x] Message history viewer
- [x] Scheduled messages calendar
- [x] Festival greetings scheduler
- [ ] Notification settings page

### Testing
- [x] Unit tests for role middleware
- [x] Unit tests for SMS/WhatsApp integration
- [x] Unit tests for automated notifications
- [x] Integration tests for message delivery


## Phase 8: Parent Portal

### Database Schema
- [ ] Create attendance table (student, date, status, remarks)
- [ ] Create leave_applications table (student, parent, dates, reason, status)
- [ ] Extend student_parents table with relationship type
- [ ] Create parent_notifications table for targeted messages

### Backend API - Parent Management
- [ ] Parent registration and invitation endpoints
- [ ] Link parent to student(s) endpoint
- [ ] Get parent's children list
- [ ] Parent profile management

### Backend API - Attendance System
- [ ] Mark daily attendance endpoint
- [ ] Get student attendance records
- [ ] Calculate attendance percentage
- [ ] Leave application CRUD endpoints
- [ ] Approve/reject leave applications

### Backend API - Parent Data Access
- [ ] Get child's academic performance
- [ ] Get child's attendance summary
- [ ] Get child's fee status
- [ ] Get parent-specific notifications

### Frontend - Parent Portal
- [ ] Parent dashboard (overview of all children)
- [ ] Child selector (if parent has multiple children)
- [ ] Academic performance view (exams, marks, grades)
- [ ] Attendance calendar view
- [ ] Leave application form
- [ ] Fee status and invoice downloads
- [ ] Notifications and announcements view

### Frontend - Admin/Teacher Views
- [ ] Daily attendance marking interface
- [ ] Class-wise attendance reports
- [ ] Leave applications approval interface
- [ ] Attendance statistics dashboard

### Testing
- [ ] Unit tests for attendance APIs
- [ ] Unit tests for parent-student associations
- [ ] Unit tests for leave applications
- [ ] Integration tests for parent portal access


## Phase 8.1: Parent Registration with OTP Verification
- [x] Add userId field to student_parents table
- [x] Create otp_verifications table (phone, otp, purpose, expiry)
- [x] Build OTP generation and sending API
- [x] Build OTP verification API
- [x] Create parent registration endpoint (student roll number + phone + OTP)
- [x] Parent registration UI with OTP flow
- [x] Parent dashboard UI
- [x] Attendance marking interface for teachers

- [x] Fix TypeError in PerformanceAnalytics - analytics.averageMarks.toFixed is not a function

- [x] Fix report card generation error when no marks exist for student

- [ ] Fix Select.Item empty value error in MessageHistory page


## Phase 9: Multi-Tenant SaaS Architecture

### Database Schema
- [ ] Create organizations table (school name, subdomain, plan, status, settings)
- [ ] Add organizationId to all existing tables (students, staff, fees, exams, etc.)
- [ ] Create organization_users mapping table (user-organization-role associations)
- [ ] Create organization_invitations table (invite tokens, expiry, role)
- [ ] Create subscription_plans table (plan features, pricing, limits)
- [ ] Add organization_settings table (custom branding, features enabled)

### Backend API - Multi-Tenancy Core
- [ ] Organization context middleware (auto-inject organizationId)
- [ ] Row-level security for all queries (filter by organizationId)
- [ ] Super admin role and permissions
- [ ] Organization-scoped authentication
- [ ] Cross-organization access prevention

### Backend API - Super Admin
- [ ] Create organization endpoint
- [ ] List all organizations with stats
- [ ] Update organization status (active, suspended, trial)
- [ ] Generate unique access links/subdomains
- [ ] Organization usage analytics
- [ ] Subscription management

### Backend API - Organization Management
- [ ] Get organization profile
- [ ] Update organization settings
- [ ] Invite users to organization
- [ ] Manage organization users and roles
- [ ] Organization-level audit logs

### Frontend - Super Admin Panel
- [ ] Super admin dashboard (all schools overview)
- [ ] Schools list with search and filters
- [ ] Create new school form
- [ ] School details page with stats
- [ ] Subscription management interface
- [ ] Usage analytics charts

### Frontend - Organization Settings
- [ ] Organization profile page
- [ ] Branding customization (logo, colors)
- [ ] User management interface
- [ ] Invitation system UI
- [ ] Organization settings page

### Data Migration
- [ ] Create default organization for existing data
- [ ] Migrate all existing records to default organization
- [ ] Update all queries to include organizationId filter

### Testing
- [ ] Unit tests for organization context middleware
- [ ] Unit tests for row-level security
- [ ] Integration tests for cross-organization isolation
- [ ] Super admin API tests
