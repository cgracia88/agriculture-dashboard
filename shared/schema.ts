import {pgTable, text, serial, integer, boolean, timestamp, real} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define the database table structure
export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  nodeID: text("node_id").notNull().unique(), // e.g., "Node-A1-001"
  location: text("location").notNull(), // e.g., "Section A1, Row 1"
  section: text("section").notNull(), // e.g., "A1"
  row: text("row").notNull(), // e.g., "1"
  isOnline: boolean("is_online").notNull().default(false), // e.g., "true"
  temperature: real("temperature"), // Celsius
  humidity: real("humidity"), // Percentage
  lastSeen: timestamp("last_seen").notNull().defaultNow(), // <-- fixed typo
  status: text("status").notNull().default("online"), // e.g., "online, offline, warning, error"
  batteryLevel: integer("battery_level").default(100), // Percentage
});

// Create Validation schemas for API request
export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  lastSeen: true, // <-- fixed typo
});

// Export TypeScript types
export type InsertNode = z.infer<z.ZodType<any, any, any> & typeof insertNodeSchema>;
