import { z } from "zod";

export const EnquiryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(150, "Email cannot exceed 150 characters"),
  type: z
    .string()
    .trim()
    .min(2, "Service type is required")
    .max(100, "Service type cannot exceed 100 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message cannot exceed 3000 characters"),
  _hp: z.string().max(0, "Automated submission rejected").optional().or(z.literal("")),
});

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "New password must be at least 10 characters long")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const EnquiryUpdateSchema = z.object({
  status: z.enum(["new", "in_progress", "contacted", "archived"]).optional(),
  notes: z.string().max(3000, "Notes cannot exceed 3000 characters").optional(),
});

export const ServiceUpdateSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  tagline: z.string().min(2).max(150).optional(),
  description: z.string().min(10).max(500).optional(),
  capabilities: z.array(z.string().min(1)).optional(),
  active: z.boolean().optional(),
});
