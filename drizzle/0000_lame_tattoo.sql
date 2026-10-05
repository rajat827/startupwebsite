CREATE TABLE `application_events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`status` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	`revision` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_events_revision` ON `application_events` (`application_id`,`revision`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`program` text NOT NULL,
	`status` text DEFAULT 'UNDER REVIEW' NOT NULL,
	`payload` text NOT NULL,
	`payload_hash` text NOT NULL,
	`submitted_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "application_program" CHECK("applications"."program" IN ('SPARK','IGNITE')),
	CONSTRAINT "application_status" CHECK("applications"."status" IN ('NEW','UNDER REVIEW','SHORTLISTED','ACCEPTED','WAITLISTED','REJECTED'))
);
--> statement-breakpoint
CREATE INDEX `applications_status_date` ON `applications` (`status`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `applications_date` ON `applications` (`submitted_at`);