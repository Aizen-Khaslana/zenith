CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`account_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_uq` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_uq` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`ai_consent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE TABLE `ai_feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`scope` text NOT NULL,
	`source` text NOT NULL,
	`model_name` text,
	`narrative` text NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`fallback_reason` text,
	`latency_ms` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ai_feedbacks_batch_scope_uq` ON `ai_feedbacks` (`batch_id`,`scope`);--> statement-breakpoint
CREATE TABLE `batch_analytics` (
	`batch_id` text PRIMARY KEY NOT NULL,
	`total_income` integer NOT NULL,
	`total_expense` integer NOT NULL,
	`expense_primer` integer NOT NULL,
	`expense_sekunder` integer NOT NULL,
	`expense_tersier` integer NOT NULL,
	`current_balance` integer NOT NULL,
	`ncf_ratio` real,
	`health_status` text NOT NULL,
	`ratio_primer` real,
	`ratio_sekunder` real,
	`ratio_tersier` real,
	`burn_rate` real NOT NULL,
	`runway_status` text NOT NULL,
	`runway_days` real,
	`regression_status` text NOT NULL,
	`slope_m` real,
	`intercept_c` real,
	`depletion_date` text,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "batch_analytics_total_chk" CHECK("batch_analytics"."total_expense" = "batch_analytics"."expense_primer" + "batch_analytics"."expense_sekunder" + "batch_analytics"."expense_tersier"),
	CONSTRAINT "batch_analytics_health_chk" CHECK("batch_analytics"."health_status" IN ('SEHAT','RAWAN','KRITIS'))
);
--> statement-breakpoint
CREATE TABLE `directories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `directories_user_created_idx` ON `directories` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`directory_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`row_count` integer NOT NULL,
	`opening_balance` integer DEFAULT 0 NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`day_count` integer NOT NULL,
	`active_day_count` integer NOT NULL,
	`engine_version` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`directory_id`) REFERENCES `directories`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "import_batches_opening_balance_chk" CHECK("import_batches"."opening_balance" >= 0),
	CONSTRAINT "import_batches_period_chk" CHECK("import_batches"."period_end" >= "import_batches"."period_start")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_batches_directory_uq` ON `import_batches` (`directory_id`);--> statement-breakpoint
CREATE TABLE `simulations` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`title` text NOT NULL,
	`scenario_type` text NOT NULL,
	`target_amount` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "simulations_target_chk" CHECK("simulations"."target_amount" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `simulations_batch_uq` ON `simulations` (`batch_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`row_number` integer NOT NULL,
	`trx_date` text NOT NULL,
	`label` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`expense_tier` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "transactions_amount_chk" CHECK("transactions"."amount" > 0),
	CONSTRAINT "transactions_type_chk" CHECK("transactions"."type" IN ('PEMASUKAN','PENGELUARAN')),
	CONSTRAINT "transactions_tier_chk" CHECK("transactions"."expense_tier" IS NULL OR "transactions"."expense_tier" IN ('PRIMER','SEKUNDER','TERSIER')),
	CONSTRAINT "transactions_tier_presence_chk" CHECK(("transactions"."type" = 'PENGELUARAN') = ("transactions"."expense_tier" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_batch_row_uq` ON `transactions` (`batch_id`,`row_number`);--> statement-breakpoint
CREATE INDEX `transactions_batch_date_idx` ON `transactions` (`batch_id`,`trx_date`);