CREATE TABLE `otp_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`otp` varchar(6) NOT NULL,
	`purpose` enum('parent_registration','password_reset','phone_verification') NOT NULL,
	`is_verified` int unsigned NOT NULL DEFAULT 0,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_parents` ADD `user_id` int;