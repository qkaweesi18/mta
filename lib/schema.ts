import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

export const tasks = pgTable('tasks', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('Todo'), // 'Todo', 'In Progress', 'Done'
});
