DROP TABLE `minera_blockchain_account`;--> statement-breakpoint
DROP TABLE `minera_blockchain_session`;--> statement-breakpoint
DROP TABLE `minera_blockchain_verification_token`;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` ADD `username` text(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` ADD `password` text(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` ADD `updatedAt` integer;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` DROP COLUMN `email_verified`;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` DROP COLUMN `image`;