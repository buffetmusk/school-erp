CREATE TABLE `exam_subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`subject_id` int NOT NULL,
	`max_marks` int unsigned NOT NULL,
	`passing_marks` int unsigned NOT NULL,
	`exam_date` timestamp NOT NULL,
	CONSTRAINT `exam_subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`weightage` int unsigned NOT NULL DEFAULT 100,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`exam_type_id` int NOT NULL,
	`academic_year_id` int NOT NULL,
	`class_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`total_marks` int unsigned NOT NULL,
	`passing_marks` int unsigned NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'SCHEDULED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_marks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`exam_subject_id` int NOT NULL,
	`marks_obtained` int unsigned NOT NULL,
	`is_absent` int unsigned NOT NULL DEFAULT 0,
	`remarks` text,
	`entered_by` int,
	`entered_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_marks_id` PRIMARY KEY(`id`)
);
