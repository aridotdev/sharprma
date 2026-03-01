CREATE TABLE `vendor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`requiredPhotos` text DEFAULT '[]' NOT NULL,
	`requiredFields` text DEFAULT '[]' NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_code_unique` ON `vendor` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_code_idx` ON `vendor` (`code`);--> statement-breakpoint
CREATE INDEX `vendor_is_active_idx` ON `vendor` (`isActive`);--> statement-breakpoint
CREATE INDEX `vendor_created_at_idx` ON `vendor` (`createdAt`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`username` text,
	`display_username` text,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `defect_master` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `defect_master_code_unique` ON `defect_master` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `defect_master_name_unique` ON `defect_master` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `defect_master_name_idx` ON `defect_master` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `defect_master_code_idx` ON `defect_master` (`code`);--> statement-breakpoint
CREATE INDEX `defect_master_is_active_idx` ON `defect_master` (`isActive`);--> statement-breakpoint
CREATE INDEX `defect_master_created_at_idx` ON `defect_master` (`createdAt`);--> statement-breakpoint
CREATE TABLE `notification_master` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notificationCode` text NOT NULL,
	`notificationDate` integer NOT NULL,
	`modelId` integer NOT NULL,
	`branch` text NOT NULL,
	`vendorId` integer NOT NULL,
	`status` text NOT NULL,
	`createdBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`modelId`) REFERENCES `product_model`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_master_notificationCode_unique` ON `notification_master` (`notificationCode`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_master_code_idx` ON `notification_master` (`notificationCode`);--> statement-breakpoint
CREATE INDEX `notification_master_vendor_idx` ON `notification_master` (`vendorId`);--> statement-breakpoint
CREATE INDEX `notification_master_date_idx` ON `notification_master` (`notificationDate`);--> statement-breakpoint
CREATE INDEX `notification_master_status_idx` ON `notification_master` (`status`);--> statement-breakpoint
CREATE INDEX `notification_master_created_at_idx` ON `notification_master` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notification_master_vendor_status_idx` ON `notification_master` (`vendorId`,`status`);--> statement-breakpoint
CREATE INDEX `notification_master_vendor_date_idx` ON `notification_master` (`vendorId`,`notificationDate`);--> statement-breakpoint
CREATE TABLE `product_model` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`inch` integer NOT NULL,
	`vendorId` integer NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_model_name_vendor_idx` ON `product_model` (`name`,`vendorId`);--> statement-breakpoint
CREATE INDEX `product_model_vendor_idx` ON `product_model` (`vendorId`);--> statement-breakpoint
CREATE INDEX `product_model_is_active_idx` ON `product_model` (`isActive`);--> statement-breakpoint
CREATE INDEX `product_model_created_at_idx` ON `product_model` (`createdAt`);--> statement-breakpoint
CREATE INDEX `product_model_vendor_is_active_idx` ON `product_model` (`vendorId`,`isActive`);