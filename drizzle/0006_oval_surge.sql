CREATE TABLE `grade_scales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grade_name` varchar(10) NOT NULL,
	`min_percentage` int unsigned NOT NULL,
	`max_percentage` int unsigned NOT NULL,
	`grade_points` int unsigned NOT NULL,
	`description` text,
	`display_order` int NOT NULL,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grade_scales_id` PRIMARY KEY(`id`),
	CONSTRAINT `grade_scales_grade_name_unique` UNIQUE(`grade_name`)
);
--> statement-breakpoint
CREATE TABLE `report_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`exam_id` int NOT NULL,
	`total_marks` int unsigned NOT NULL,
	`marks_obtained` int unsigned NOT NULL,
	`percentage` int unsigned NOT NULL,
	`overall_grade` varchar(10),
	`rank` int unsigned,
	`remarks` text,
	`pdf_url` text,
	`generated_by` int NOT NULL,
	`generated_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_marks` ADD `grade` varchar(10);