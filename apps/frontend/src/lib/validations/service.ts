import type { createServiceRequestSchema } from "@slotbook/shared";
import { z } from "zod";

export type CreateServiceFormInput = z.input<typeof createServiceRequestSchema>;
export type CreateServiceFormValues = z.output<typeof createServiceRequestSchema>;
