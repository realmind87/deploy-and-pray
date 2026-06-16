CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "items_created_at_idx" ON "items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "items_title_idx" ON "items" USING btree ("title");