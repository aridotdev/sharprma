CREATE TABLE `claim` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claimNumber` text NOT NULL,
	`notificationId` integer NOT NULL,
	`modelId` integer NOT NULL,
	`vendorId` integer NOT NULL,
	`inch` integer NOT NULL,
	`branch` text NOT NULL,
	`odfNumber` text,
	`panelSerialNo` text NOT NULL,
	`ocSerialNo` text NOT NULL,
	`defectCode` text NOT NULL,
	`version` text,
	`week` text,
	`claimStatus` text NOT NULL,
	`submittedBy` integer NOT NULL,
	`updatedBy` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`notificationId`) REFERENCES `notification_master`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`modelId`) REFERENCES `product_model`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`defectCode`) REFERENCES `defect_master`(`code`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claim_claimNumber_unique` ON `claim` (`claimNumber`);--> statement-breakpoint
CREATE UNIQUE INDEX `claim_number_idx` ON `claim` (`claimNumber`);--> statement-breakpoint
CREATE INDEX `claim_vendor_idx` ON `claim` (`vendorId`);--> statement-breakpoint
CREATE INDEX `claim_status_idx` ON `claim` (`claimStatus`);--> statement-breakpoint
CREATE INDEX `claim_submitted_by_idx` ON `claim` (`submittedBy`);--> statement-breakpoint
CREATE INDEX `claim_vendor_status_idx` ON `claim` (`vendorId`,`claimStatus`);--> statement-breakpoint
CREATE TABLE `claim_photo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claimId` integer NOT NULL,
	`photoType` text NOT NULL,
	`filePath` text NOT NULL,
	`thumbnailPath` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`rejectReason` text,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`claimId`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claim_photo_claim_type_idx` ON `claim_photo` (`claimId`,`photoType`);--> statement-breakpoint
CREATE INDEX `claim_photo_claim_idx` ON `claim_photo` (`claimId`);--> statement-breakpoint
CREATE TABLE `claim_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claimId` integer NOT NULL,
	`action` text NOT NULL,
	`fromStatus` text NOT NULL,
	`toStatus` text NOT NULL,
	`userId` integer NOT NULL,
	`userRole` text NOT NULL,
	`note` text,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`claimId`) REFERENCES `claim`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `claim_history_claim_idx` ON `claim_history` (`claimId`);--> statement-breakpoint
CREATE INDEX `claim_history_user_idx` ON `claim_history` (`userId`);