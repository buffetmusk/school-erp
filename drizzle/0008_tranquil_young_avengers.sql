CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`date` date NOT NULL,
	`status` enum('present','absent','late','half_day') NOT NULL,
	`remarks` text,
	`marked_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`parent_id` int NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`review_comments` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parent_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int NOT NULL,
	`student_id` int,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`category` enum('attendance','marks','fees','general','announcement') NOT NULL,
	`is_read` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_notifications_id` PRIMARY KEY(`id`)
);
