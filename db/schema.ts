import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const menuContent = sqliteTable("menu_content", {
  id: integer("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["owner", "editor"] }).notNull(),
  createdAt: text("created_at").notNull(),
});
