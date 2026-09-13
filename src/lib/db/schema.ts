import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// Kept in sync with GenerationOptions in src/lib/gemini.ts by hand — not
// imported directly to avoid coupling the schema to that module.
type GenerationOptions = {
  backgroundMode: "reference" | "original";
  styleStrength: "subtle" | "full";
};

// App-side user row, keyed by the Neon Auth (Stack Auth) user id.
// Neon Auth syncs its own copy of user records into `neon_auth.users_sync`;
// this table only holds the fields the product needs (credits) alongside that id.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // matches Stack Auth user id
  email: text("email").notNull(),
  creditBalance: integer("credit_balance").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referenceStyles = pgTable("reference_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // nullable for MVP, filled in for phase 2 categories/filters
  referenceImageUrl: text("reference_image_url").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generationStatus = pgEnum("generation_status", [
  "pending",
  "processing",
  "complete",
  "failed",
]);

export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  referenceStyleId: uuid("reference_style_id")
    .notNull()
    .references(() => referenceStyles.id),
  sourceImageUrl: text("source_image_url").notNull(),
  sourceMimeType: text("source_mime_type").notNull().default("image/jpeg"),
  resultImageUrl: text("result_image_url"),
  status: generationStatus("status").notNull().default("pending"),

  // Face-match confidence, from comparing sourceImageUrl against resultImageUrl
  // (0-100 similarity score). Null until the check has run.
  confidenceScore: real("confidence_score"),

  // Attempt chain bookkeeping: attempt_number/parentGenerationId link retries
  // of the same upload together, so the free regen can be capped at one per chain.
  attemptNumber: integer("attempt_number").notNull().default(1),
  parentGenerationId: uuid("parent_generation_id"),
  freeRegenUsed: boolean("free_regen_used").notNull().default(false),
  creditCharged: boolean("credit_charged").notNull().default(true),

  // What the user chose for this attempt (background mode, style strength).
  // jsonb rather than one column per toggle so new options don't need a migration.
  options: jsonb("options").$type<GenerationOptions>().notNull().default({
    backgroundMode: "reference",
    styleStrength: "full",
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const creditTransactionType = pgEnum("credit_transaction_type", [
  "purchase",
  "spend",
]);

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  amount: integer("amount").notNull(), // positive for purchase, negative for spend
  type: creditTransactionType("type").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
