CREATE TABLE `class_subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`class_id` int NOT NULL,
	`subject_id` int NOT NULL,
	`is_compulsory` int unsigned NOT NULL DEFAULT 1,
	CONSTRAINT `class_subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`target_role` varchar(50),
	`is_read` int unsigned NOT NULL DEFAULT 0,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`class_id` int NOT NULL,
	`capacity` int DEFAULT 40,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_no` varchar(20) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`role` varchar(50) NOT NULL,
	`department` varchar(100),
	`date_of_joining` timestamp,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_staff_no_unique` UNIQUE(`staff_no`)
);
--> statement-breakpoint
CREATE TABLE `student_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`document_type_id` int NOT NULL,
	`file_path` varchar(500) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_parents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`relationship` varchar(20) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20) NOT NULL,
	`occupation` varchar(100),
	`is_primary` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_parents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(20) NOT NULL,
	`description` text,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `subjects_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `students` ADD `date_of_birth` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `gender` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `blood_group` varchar(5);--> statement-breakpoint
ALTER TABLE `students` ADD `address` text;--> statement-breakpoint
ALTER TABLE `students` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `students` ADD `state` varchar(100);--> statement-breakpoint
ALTER TABLE `students` ADD `pincode` varchar(10);--> statement-breakpoint
ALTER TABLE `students` ADD `section_id` int;--> statement-breakpoint
ALTER TABLE `students` ADD `roll_no` varchar(20);--> statement-breakpoint
ALTER TABLE `students` ADD `status` varchar(20) DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `admission_date` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;