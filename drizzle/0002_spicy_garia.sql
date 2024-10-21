CREATE TABLE `minera_blockchain_document` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`created_by` text(255) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`aproved_by` text(255),
	`aproved_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `minera_blockchain_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aproved_by`) REFERENCES `minera_blockchain_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `minera_blockchain_transactions_a` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash_t` text(256) NOT NULL,
	`hash_image` text(256) NOT NULL,
	`document_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `minera_blockchain_document`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `minera_blockchain_post`;--> statement-breakpoint
ALTER TABLE `minera_blockchain_user` DROP COLUMN `updatedAt`;