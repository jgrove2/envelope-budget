import { pgTable, serial, text, integer, timestamp, jsonb, numeric } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const payee = pgTable('payee', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	name: text('name').notNull(),
})

export const category = pgTable('category', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	name: text('name').notNull(),
	groupId: text('group_id').notNull(),
	budget: jsonb('budget').notNull(),
	creationDate: timestamp('creation_date', { withTimezone: true, mode: 'date' }).notNull(),
})

export const categoryGroup = pgTable('category_group', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	name: text('name').notNull(),
	creationDate: timestamp('creation_date', { withTimezone: true, mode: 'date' }).notNull(),
})

export const transaction = pgTable('transaction', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	transactionAmount: numeric('transaction_amount').notNull(),
	payeeId: text('payee_id').notNull().references(() => payee.id),
	transactionDate: timestamp('transaction_date', { withTimezone: true, mode: 'date' }).notNull(),
	categoryId: text('category_id').notNull().references(() => category.id),
})


export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Payee = typeof payee.$inferSelect;

export type Category = typeof category.$inferSelect;

export type CategoryGroup = typeof categoryGroup.$inferSelect;

export type Transaction = typeof transaction.$inferSelect;

