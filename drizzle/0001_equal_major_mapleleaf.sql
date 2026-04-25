CREATE TABLE `academic_years` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academic_years_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adm_application_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` varchar(36) NOT NULL,
	`document_type_id` int NOT NULL,
	`file_path` varchar(500) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adm_application_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adm_application_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` varchar(36) NOT NULL,
	`old_status` varchar(20),
	`new_status` varchar(20) NOT NULL,
	`changed_by` int,
	`changed_at` timestamp NOT NULL DEFAULT (now()),
	`remarks` text,
	CONSTRAINT `adm_application_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adm_applications` (
	`id` varchar(36) NOT NULL,
	`application_no` varchar(20) NOT NULL,
	`academic_year_id` int NOT NULL,
	`class_id` int NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`date_of_birth` timestamp NOT NULL,
	`gender` varchar(10) NOT NULL,
	`contact_email` varchar(320),
	`contact_phone` varchar(20),
	`status` varchar(20) NOT NULL DEFAULT 'SUBMITTED',
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adm_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `adm_applications_application_no_unique` UNIQUE(`application_no`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`display_order` int NOT NULL,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_required` int unsigned NOT NULL DEFAULT 0,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_heads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fee_heads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_id` int NOT NULL,
	`fee_head_id` int NOT NULL,
	`amount` int unsigned NOT NULL,
	CONSTRAINT `fee_invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_no` varchar(20) NOT NULL,
	`student_id` int NOT NULL,
	`issue_date` timestamp NOT NULL,
	`due_date` timestamp NOT NULL,
	`total_amount` int unsigned NOT NULL,
	`amount_paid` int unsigned NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'UNPAID',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fee_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `fee_invoices_invoice_no_unique` UNIQUE(`invoice_no`)
);
--> statement-breakpoint
CREATE TABLE `fee_payments` (
	`id` varchar(36) NOT NULL,
	`student_id` int NOT NULL,
	`invoice_id` int NOT NULL,
	`amount_paid` int unsigned NOT NULL,
	`payment_date` timestamp NOT NULL,
	`payment_mode` varchar(20) NOT NULL,
	`transaction_ref` varchar(100),
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fee_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_structure_components` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fee_structure_id` int NOT NULL,
	`fee_head_id` int NOT NULL,
	`amount` int unsigned NOT NULL,
	CONSTRAINT `fee_structure_components_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_structures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`academic_year_id` int NOT NULL,
	`class_id` int NOT NULL,
	`total_amount` int unsigned NOT NULL,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fee_structures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_no` varchar(20) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`class_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`application_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_student_no_unique` UNIQUE(`student_no`)
);
