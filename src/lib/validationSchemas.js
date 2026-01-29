import { z } from 'zod';

/**
 * Common Zod validation schemas for forms
 * Reusable across different forms to ensure consistency
 */

// Email validation
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Phone number validation
export const phoneSchema = z.string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Required string field
export const requiredString = (fieldName = 'This field') => 
  z.string().min(1, `${fieldName} is required`);

// Optional string field
export const optionalString = z.string().optional().or(z.literal(''));

// URL validation
export const urlSchema = z.string()
  .url('Invalid URL')
  .optional()
  .or(z.literal(''));

// Date validation
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
  .optional();

// Number validation with range
export const numberInRange = (min, max, fieldName = 'Number') =>
  z.number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

/**
 * Example: Login Form Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Example: Registration Form Schema
 */
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Example: Employee Form Schema
 */
export const employeeSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  department: requiredString('Department'),
  designation: requiredString('Designation'),
  joiningDate: dateSchema,
});

export default {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  requiredString,
  optionalString,
  urlSchema,
  dateSchema,
  numberInRange,
  loginSchema,
  registerSchema,
  employeeSchema,
};
