CREATE TABLE `profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userAuthId` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`branch` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`userAuthId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_userAuthId_unique` ON `profile` (`userAuthId`);--> statement-breakpoint
CREATE UNIQUE INDEX `profile_user_auth_id_idx` ON `profile` (`userAuthId`);--> statement-breakpoint
CREATE INDEX `profile_role_idx` ON `profile` (`role`);--> statement-breakpoint
CREATE INDEX `profile_branch_idx` ON `profile` (`branch`);