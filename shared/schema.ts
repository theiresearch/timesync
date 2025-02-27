import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  timeZone: text("time_zone").notNull(),
  flag: text("flag").notNull(),
  workingHoursStart: text("working_hours_start").notNull(),
  workingHoursEnd: text("working_hours_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  duration: integer("duration").notNull(),
  timezone: text("timezone").notNull(),
  participants: jsonb("participants").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team Member schemas
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const teamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  timeZone: z.string(),
  flag: z.string(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  createdAt: z.string().optional(),
});

// Meeting schemas
export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const meetingSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  timezone: z.string(),
  participants: z.array(z.object({
    teamMemberId: z.number(),
    localStartTime: z.string(),
    localEndTime: z.string(),
    localDate: z.string(),
  })),
  createdAt: z.string().optional(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
