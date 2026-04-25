CREATE TABLE `leave_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`max_days_per_year` int unsigned NOT NULL,
	`is_paid` int unsigned NOT NULL DEFAULT 1,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `leave_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `staff_leaves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`leave_type_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`days` int unsigned NOT NULL,
	`reason` text,
	`status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_leaves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`payment_date` timestamp NOT NULL,
	`month` int unsigned NOT NULL,
	`year` int unsigned NOT NULL,
	`amount` int unsigned NOT NULL,
	`payment_mode` varchar(20) NOT NULL,
	`reference_no` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'PAID',
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_salaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`basic_salary` int unsigned NOT NULL,
	`allowances` int unsigned NOT NULL DEFAULT 0,
	`deductions` int unsigned NOT NULL DEFAULT 0,
	`effective_from` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_salaries_id` PRIMARY KEY(`id`)
);
