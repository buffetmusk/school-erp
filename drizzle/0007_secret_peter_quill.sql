CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_name` varchar(200),
	`user_role` varchar(50),
	`action` varchar(100) NOT NULL,
	`resource` varchar(100) NOT NULL,
	`resource_id` int,
	`details` text,
	`ip_address` varchar(50),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` enum('attendance','fees','marks','general','festival') NOT NULL,
	`channel` enum('sms','whatsapp','both') NOT NULL,
	`subject` varchar(200),
	`content` text NOT NULL,
	`variables` text,
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `message_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `message_templates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipient_type` enum('parent','student','staff','all_parents') NOT NULL,
	`recipient_id` int,
	`recipient_phone` varchar(20) NOT NULL,
	`recipient_name` varchar(200),
	`channel` enum('sms','whatsapp') NOT NULL,
	`template_id` int,
	`subject` varchar(200),
	`content` text NOT NULL,
	`status` enum('pending','sent','failed','delivered') NOT NULL DEFAULT 'pending',
	`delivery_status` text,
	`sent_by` int NOT NULL,
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('admin','principal','teacher','accountant','parent','student') NOT NULL,
	`resource` varchar(100) NOT NULL,
	`action` enum('create','read','update','delete','all') NOT NULL,
	`is_allowed` int unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`template_id` int NOT NULL,
	`recipient_type` enum('all_parents','all_students','all_staff','specific_class') NOT NULL,
	`class_id` int,
	`channel` enum('sms','whatsapp','both') NOT NULL,
	`schedule_type` enum('once','daily','weekly','monthly','yearly') NOT NULL,
	`schedule_date` timestamp,
	`schedule_time` varchar(10),
	`schedule_day_of_week` int,
	`schedule_day_of_month` int,
	`schedule_month_day` varchar(10),
	`is_active` int unsigned NOT NULL DEFAULT 1,
	`last_run` timestamp,
	`next_run` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','principal','teacher','accountant','parent','student') NOT NULL DEFAULT 'parent';