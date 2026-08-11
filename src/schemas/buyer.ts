import { z } from 'zod';

export const buyerTypes = [
  'INDIVIDUAL',
  'BUSINESS',
  'FLEET_OPERATOR',
  'TAXI_ASSOCIATION',
  'NGO',
  'GOVERNMENT',
  'SCHOOL',
  'HOTEL',
  'LOGISTICS_COMPANY',
] as const;

export type BuyerType = (typeof buyerTypes)[number];

/** Buyer types that must provide an organization / business name. */
export const organizationBuyerTypes = buyerTypes.filter(
  (type): type is Exclude<BuyerType, 'INDIVIDUAL'> => type !== 'INDIVIDUAL',
);

export function requiresOrganizationName(buyerType: BuyerType): boolean {
  return buyerType !== 'INDIVIDUAL';
}

const optionalProfileString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed === '' ? undefined : trimmed;
    });

export const createBuyerProfileSchema = z
  .object({
    buyerType: z.enum(buyerTypes),
    organizationName: optionalProfileString(255),
    taxId: optionalProfileString(255),
    address: optionalProfileString(255),
    city: z
      .string()
      .trim()
      .min(1, 'City is required')
      .max(255, 'City is too long'),
    country: z
      .string()
      .trim()
      .length(2, 'Country must be a 2-letter ISO code (e.g. RW)'),
    nationalId: optionalProfileString(255),
    passportNumber: optionalProfileString(255),
  })
  .superRefine((data, ctx) => {
    if (requiresOrganizationName(data.buyerType) && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization name is required for this buyer type',
        path: ['organizationName'],
      });
    }
  });

/** Raw form values (empty strings allowed before parse). */
export type CreateBuyerProfileFormValues = z.input<
  typeof createBuyerProfileSchema
>;
/** Parsed payload for API calls. */
export type CreateBuyerProfileInput = z.output<typeof createBuyerProfileSchema>;

export const updateBuyerProfileSchema = z
  .object({
    buyerType: z.enum(buyerTypes).optional(),
    organizationName: optionalProfileString(255),
    taxId: optionalProfileString(255),
    address: optionalProfileString(255),
    city: z.string().trim().min(1).max(255).optional().or(z.literal('')),
    country: z
      .string()
      .trim()
      .length(2, 'Country must be a 2-letter ISO code (e.g. RW)')
      .optional()
      .or(z.literal('')),
    nationalId: optionalProfileString(255),
    passportNumber: optionalProfileString(255),
  })
  .superRefine((data, ctx) => {
    if (!data.buyerType) return;
    if (requiresOrganizationName(data.buyerType) && !data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization name is required for this buyer type',
        path: ['organizationName'],
      });
    }
  });

export type UpdateBuyerProfileFormValues = z.input<
  typeof updateBuyerProfileSchema
>;
export type UpdateBuyerProfileInput = z.output<typeof updateBuyerProfileSchema>;

export const requestInvoiceSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  buyerAddress: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export type RequestInvoiceInput = z.infer<typeof requestInvoiceSchema>;

export const submitPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amountPaid: z.number().min(0),
  currency: z.enum(['USD', 'RWF']),
  bankName: z.string().max(200).optional(),
  transferReference: z.string().max(200).optional(),
  paymentDate: z.string().optional(),
  senderName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;

export const financingRequestSchema = z
  .object({
    buyerName: z.string().min(1).max(200),
    phone: z.string().min(3).max(32),
    buyerType: z.enum(buyerTypes).optional(),
    invoiceId: z.string().optional(),
    listingId: z.string().optional(),
    preferredDepositUsd: z.number().min(0).optional(),
    preferredBankName: z.string().max(200).optional(),
    employmentStatus: z.string().max(200).optional(),
    organizationName: z.string().max(200).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((data) => Boolean(data.invoiceId?.trim() || data.listingId?.trim()), {
    message: 'Link an invoice or a listing',
    path: ['listingId'],
  });

export type FinancingRequestInput = z.infer<typeof financingRequestSchema>;
