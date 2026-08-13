import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(255, 'Too long'),
  description: z.string().max(1000, 'Too long'),
  category: z.string().max(120),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive('Enter duration')
    .max(24 * 60),
  priceCents: z.coerce.number().int().nonnegative('Price cannot be negative'),
  currency: z.string().length(3).default('PLN'),
});

export type CreateServiceFormInput = z.input<typeof createServiceSchema>;
export type CreateServiceFormValues = z.output<typeof createServiceSchema>;
