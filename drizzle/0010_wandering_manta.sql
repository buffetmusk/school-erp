CREATE TABLE `organization_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('admin','principal','teacher','accountant','parent','student') NOT NULL,
	`token` varchar(100) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `organization_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('admin','principal','teacher','accountant','parent','student') NOT NULL,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`subdomain` varchar(100) NOT NULL,
	`logo` varchar(500),
	`primary_color` varchar(7) DEFAULT '#3b82f6',
	`status` enum('active','suspended','trial') NOT NULL DEFAULT 'trial',
	`subscription_plan` varchar(50) DEFAULT 'basic',
	`max_students` int unsigned DEFAULT 500,
	`max_staff` int unsigned DEFAULT 50,
	`trial_ends_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_subdomain_unique` UNIQUE(`subdomain`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','principal','teacher','accountant','parent','student','super_admin') NOT NULL DEFAULT 'parent';--> statement-breakpoint
ALTER TABLE `academic_years` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `adm_application_documents` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `adm_application_status_history` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `attendance` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `class_subjects` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `classes` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `document_types` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `exam_subjects` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `exam_types` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fee_heads` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fee_invoice_items` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fee_invoices` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fee_structure_components` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fee_structures` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `grade_scales` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `leave_applications` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `leave_types` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `message_templates` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `otp_verifications` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `parent_notifications` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `permissions` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `report_cards` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_messages` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sections` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_leaves` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_payments` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_salaries` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `student_documents` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `student_marks` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `student_parents` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `subjects` ADD `organization_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_super_admin` int unsigned DEFAULT 0 NOT NULL;