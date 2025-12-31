CREATE TABLE `claim_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_id` integer NOT NULL,
	`action` text NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`user_id` integer NOT NULL,
	`user_role` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`claim_id`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user_rma`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `claim_history_claim_idx` ON `claim_history` (`claim_id`);--> statement-breakpoint
CREATE INDEX `claim_history_user_idx` ON `claim_history` (`user_id`);--> statement-breakpoint
CREATE INDEX `claim_history_action_idx` ON `claim_history` (`action`);--> statement-breakpoint
CREATE TABLE `claim_photo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_id` integer NOT NULL,
	`photo_type` text NOT NULL,
	`file_path` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`claim_id`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `claim_photo_claim_idx` ON `claim_photo` (`claim_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `claim_photo_claim_id_photo_type_idx` ON `claim_photo` (`claim_id`,`photo_type`);--> statement-breakpoint
CREATE TABLE `claim` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_number` text NOT NULL,
	`notification` text NOT NULL,
	`model_name` text NOT NULL,
	`vendor_id` integer NOT NULL,
	`inch` text NOT NULL,
	`branch` text NOT NULL,
	`odf_number` text,
	`panel_serial_no` text NOT NULL,
	`oc_serial_no` text NOT NULL,
	`defect` text NOT NULL,
	`version` text,
	`week` text,
	`claim_status` text DEFAULT 'DRAFT' NOT NULL,
	`submitted_by` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`submitted_by`) REFERENCES `user_rma`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claim_claim_number_unique` ON `claim` (`claim_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `claim_number_idx` ON `claim` (`claim_number`);--> statement-breakpoint
CREATE INDEX `claim_vendor_idx` ON `claim` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `claim_status_idx` ON `claim` (`claim_status`);--> statement-breakpoint
CREATE INDEX `claim_submitted_by_idx` ON `claim` (`submitted_by`);--> statement-breakpoint
CREATE INDEX `claim_vendor_status_idx` ON `claim` (`vendor_id`,`claim_status`);--> statement-breakpoint
CREATE TABLE `notification_ref` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notification_code` text NOT NULL,
	`model_name` text NOT NULL,
	`vendor_id` integer NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_by` integer NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `user_rma`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_ref_notification_code_unique` ON `notification_ref` (`notification_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_ref_code_uq` ON `notification_ref` (`notification_code`);--> statement-breakpoint
CREATE INDEX `notification_ref_vendor_idx` ON `notification_ref` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `notification_ref_status_idx` ON `notification_ref` (`status`);--> statement-breakpoint
CREATE TABLE `photo_review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_photo_id` integer NOT NULL,
	`reviewed_by` integer NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`claim_photo_id`) REFERENCES `claim_photo`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user_rma`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `photo_review_claim_photo_idx` ON `photo_review` (`claim_photo_id`);--> statement-breakpoint
CREATE INDEX `photo_review_reviewed_by_idx` ON `photo_review` (`reviewed_by`);--> statement-breakpoint
CREATE INDEX `photo_review_status_idx` ON `photo_review` (`status`);--> statement-breakpoint
CREATE TABLE `product_model` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_id` integer NOT NULL,
	`model_name` text NOT NULL,
	`inch` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_model_vendor_idx` ON `product_model` (`vendor_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_model_name_uq` ON `product_model` (`model_name`);--> statement-breakpoint
CREATE TABLE `user_rma` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_auth_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_rma_user_auth_id_unique` ON `user_rma` (`user_auth_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_id_idx` ON `user_rma` (`user_auth_id`);--> statement-breakpoint
CREATE INDEX `user_role_idx` ON `user_rma` (`role`);--> statement-breakpoint
CREATE TABLE `vendor_claim_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_claim_id` integer NOT NULL,
	`claim_id` integer NOT NULL,
	`vendor_decision` text NOT NULL,
	`compensation_amount` integer,
	`note` text,
	`decision_at` text NOT NULL,
	FOREIGN KEY (`vendor_claim_id`) REFERENCES `vendor_claim`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`claim_id`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `vendor_claim_item_vendor_claim_idx` ON `vendor_claim_item` (`vendor_claim_id`);--> statement-breakpoint
CREATE INDEX `vendor_claim_item_claim_idx` ON `vendor_claim_item` (`claim_id`);--> statement-breakpoint
CREATE TABLE `vendor_claim` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_claim_no` text NOT NULL,
	`vendor_id` integer NOT NULL,
	`submitted_at` text NOT NULL,
	`report_snapshot` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `user_rma`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_claim_vendor_claim_no_unique` ON `vendor_claim` (`vendor_claim_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_claim_no_idx` ON `vendor_claim` (`vendor_claim_no`);--> statement-breakpoint
CREATE INDEX `vendor_claim_vendor_idx` ON `vendor_claim` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `vendor_claim_created_by_idx` ON `vendor_claim` (`created_by`);--> statement-breakpoint
CREATE TABLE `vendor_field_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_id` integer NOT NULL,
	`field_name` text NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_field_rule_vendor_field_name_idx` ON `vendor_field_rule` (`vendor_id`,`field_name`);--> statement-breakpoint
CREATE INDEX `vendor_field_rule_vendor_idx` ON `vendor_field_rule` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `vendor_photo_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendor_id` integer NOT NULL,
	`photo_type` text NOT NULL,
	`is_required` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_photo_rule_vendor_photo_type_idx` ON `vendor_photo_rule` (`vendor_id`,`photo_type`);--> statement-breakpoint
CREATE INDEX `vendor_photo_rule_vendor_idx` ON `vendor_photo_rule` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `vendor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_name_unique` ON `vendor` (`name`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`userId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);