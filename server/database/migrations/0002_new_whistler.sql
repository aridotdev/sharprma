CREATE TABLE `vendor_claim` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendorClaimNo` text NOT NULL,
	`vendorId` integer NOT NULL,
	`submittedAt` integer NOT NULL,
	`reportSnapshot` text NOT NULL,
	`status` text NOT NULL,
	`createdBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_claim_vendorClaimNo_unique` ON `vendor_claim` (`vendorClaimNo`);--> statement-breakpoint
CREATE UNIQUE INDEX `vendor_claim_no_idx` ON `vendor_claim` (`vendorClaimNo`);--> statement-breakpoint
CREATE INDEX `vendor_claim_vendor_idx` ON `vendor_claim` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendor_claim_status_idx` ON `vendor_claim` (`status`);--> statement-breakpoint
CREATE INDEX `vendor_claim_created_at_idx` ON `vendor_claim` (`createdAt`);--> statement-breakpoint
CREATE TABLE `vendor_claim_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vendorClaimId` integer NOT NULL,
	`claimId` integer NOT NULL,
	`vendorDecision` text NOT NULL,
	`compensation` integer,
	`rejectReason` text,
	`vendorDecisionBy` integer,
	`vendorDecisionAt` integer,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`vendorClaimId`) REFERENCES `vendor_claim`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`claimId`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `vendor_claim_item_vendor_claim_idx` ON `vendor_claim_item` (`vendorClaimId`);--> statement-breakpoint
CREATE INDEX `vendor_claim_item_claim_idx` ON `vendor_claim_item` (`claimId`);--> statement-breakpoint
CREATE TABLE `photo_review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claimPhotoId` integer NOT NULL,
	`reviewedBy` integer NOT NULL,
	`status` text NOT NULL,
	`rejectReason` text,
	`reviewedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`claimPhotoId`) REFERENCES `claim_photo`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `photo_review_claim_photo_idx` ON `photo_review` (`claimPhotoId`);--> statement-breakpoint
CREATE INDEX `photo_review_reviewer_idx` ON `photo_review` (`reviewedBy`);--> statement-breakpoint
CREATE TABLE `sequence_generator` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`currentDate` text NOT NULL,
	`lastSequence` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sequence_generator_type_date_idx` ON `sequence_generator` (`type`,`currentDate`);