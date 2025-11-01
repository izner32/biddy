import { pgTable, text, numeric, timestamp, uuid, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'accepted', 'rejected']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  clerkId: text('clerk_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Collections table
export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  stock: numeric('stock').notNull(),
  price: numeric('price').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bids table
export const bids = pgTable('bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  price: numeric('price').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: bidStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  collectionIdIdx: index('bids_collection_id_idx').on(table.collectionId),
  userIdIdx: index('bids_user_id_idx').on(table.userId),
  statusIdx: index('bids_status_idx').on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
  bids: many(bids),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(users, {
    fields: [collections.ownerId],
    references: [users.id],
  }),
  bids: many(bids),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  collection: one(collections, {
    fields: [bids.collectionId],
    references: [collections.id],
  }),
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}));
