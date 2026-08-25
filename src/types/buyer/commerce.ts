export type {
  AdminOrder as BuyerOrder,
  AdminInvoice as BuyerInvoice,
  AdminPayment as BuyerPayment,
  AdminFinancingRequest as BuyerFinancingRequest,
  OrderTrackingEvent as BuyerOrderTrackingEvent,
  InvoiceStatus as BuyerInvoiceStatus,
  OrderStatus as BuyerOrderStatus,
  PaymentStatus as BuyerPaymentStatus,
  FinancingStatus as BuyerFinancingStatus,
} from '@/types/commerce';

export type BuyerOrdersFilters = {
  status?: import('@/types/commerce').OrderStatus;
  page?: number;
  limit?: number;
};

export type BuyerInvoicesFilters = {
  status?: import('@/types/commerce').InvoiceStatus;
  pendingPurchase?: boolean;
  payableOnly?: boolean;
  listingId?: string;
  page?: number;
  limit?: number;
};

export type BuyerPaymentsFilters = {
  status?: import('@/types/commerce').PaymentStatus;
  page?: number;
  limit?: number;
};

export type BuyerOrderTracking = {
  order: {
    id: string;
    orderNumber: string;
    status: import('@/types/commerce').OrderStatus;
    sellerType: string;
    stages: import('@/types/commerce').OrderStatus[];
  };
  events: import('@/types/commerce').OrderTrackingEvent[];
};

export type PublicListingSummary = {
  id: string;
  listingTitle: string;
  slug: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  status: string;
  listingPricing?: {
    finalPriceUsd: number;
    finalPriceRwf?: number | null;
    displayPriceRwf?: number | null;
    currency: string;
  } | null;
};
