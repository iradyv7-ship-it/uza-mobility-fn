'use client';

import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
} from '@/lib/api/multipart';
import { apiFetchPaginated } from '@/lib/api/api';
import { siteConfig } from '@/config/site';
import { getSession } from 'next-auth/react';
import {
  downloadInvoiceDocumentPdf,
  fetchAuthenticatedInvoiceDocument,
  invoiceDocumentFilename,
  openInvoiceDocumentPdf,
} from '@/lib/api/invoice-document';
import { normalizeBuyerProfileBody } from '@/lib/buyer/profile-payload';
import { toSearchParams } from '@/lib/api/query-params';
import type {
  CreateBuyerProfileInput,
  FinancingRequestInput,
  RequestInvoiceInput,
  SubmitPaymentInput,
  UpdateBuyerProfileInput,
} from '@/schemas/buyer';
import type { MeBuyerProfile } from '@/types/auth/buyer-profile';
import type {
  BuyerFinancingRequest,
  BuyerInvoice,
  BuyerOrder,
  BuyerOrderTracking,
  BuyerPayment,
  BuyerInvoicesFilters,
  BuyerOrdersFilters,
  BuyerPaymentsFilters,
  PublicListingSummary,
} from '@/types/buyer/commerce';
import type { PaginatedResult } from '@/types/api/pagination';

export function getBuyerProfile(accessToken?: string) {
  return authenticatedFetch<MeBuyerProfile>('/users/buyer-profile', {
    token: accessToken,
  });
}

export function createBuyerProfile(body: CreateBuyerProfileInput) {
  return authenticatedFetch<MeBuyerProfile>('/users/buyer-profile', {
    method: 'POST',
    body: JSON.stringify(normalizeBuyerProfileBody(body)),
  });
}

export function updateBuyerProfile(body: UpdateBuyerProfileInput) {
  return authenticatedFetch<MeBuyerProfile>('/users/buyer-profile', {
    method: 'PATCH',
    body: JSON.stringify(normalizeBuyerProfileBody(body)),
  });
}

export function getMyOrders(
  filters: BuyerOrdersFilters = {},
  accessToken?: string,
) {
  return authenticatedPaginatedFetch<BuyerOrder>('/orders/my', {
    token: accessToken,
    searchParams: toSearchParams(filters),
  });
}

export function getOrderTracking(orderId: string, accessToken?: string) {
  return authenticatedFetch<BuyerOrderTracking>(`/orders/${orderId}/tracking`, {
    token: accessToken,
  });
}

export function getMyInvoices(
  filters: BuyerInvoicesFilters = {},
  accessToken?: string,
) {
  return authenticatedPaginatedFetch<BuyerInvoice>('/invoices/my', {
    token: accessToken,
    searchParams: toSearchParams(filters),
  });
}

export function getMyInvoice(id: string, accessToken?: string) {
  return authenticatedFetch<BuyerInvoice>(`/invoices/${id}`, {
    token: accessToken,
  });
}

export function requestInvoice(body: RequestInvoiceInput) {
  return authenticatedFetch<BuyerInvoice>('/invoices/request', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      buyerAddress: body.buyerAddress?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
    }),
  });
}

export function cancelMyInvoice(id: string) {
  return authenticatedFetch<BuyerInvoice>(`/invoices/${id}/cancel`, {
    method: 'PATCH',
  });
}

async function fetchBuyerInvoiceDocument(invoiceId: string) {
  const session = await getSession();
  const token = session?.accessToken;
  if (!token) throw new Error('Not authenticated');

  return fetchAuthenticatedInvoiceDocument(
    `${siteConfig.apiUrl}/invoices/${invoiceId}/document`,
    token,
  );
}

export async function openInvoiceDocument(invoiceId: string) {
  const blob = await fetchBuyerInvoiceDocument(invoiceId);
  openInvoiceDocumentPdf(blob);
}

export async function downloadInvoiceDocument(
  invoiceId: string,
  invoiceNumber: string,
) {
  const blob = await fetchBuyerInvoiceDocument(invoiceId);
  downloadInvoiceDocumentPdf(blob, invoiceDocumentFilename(invoiceNumber));
}

export function getMyPayments(
  filters: BuyerPaymentsFilters = {},
  accessToken?: string,
) {
  return authenticatedPaginatedFetch<BuyerPayment>('/payments/my', {
    token: accessToken,
    searchParams: toSearchParams(filters),
  });
}

export function submitPayment(body: SubmitPaymentInput, proofs: File[] = []) {
  const form = buildMultipartFormData(body, [
    { field: 'proofs', files: proofs },
  ]);
  return authenticatedMultipartFetch<BuyerPayment>('/payments/submit', form);
}

export function getMyFinancingRequests(accessToken?: string) {
  return authenticatedFetch<BuyerFinancingRequest[]>('/financing/my', {
    token: accessToken,
  });
}

export function submitFinancingRequest(body: FinancingRequestInput) {
  return authenticatedFetch<BuyerFinancingRequest>('/financing/request', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      invoiceId: body.invoiceId?.trim() || undefined,
      listingId: body.listingId?.trim() || undefined,
      organizationName: body.organizationName?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
    }),
  });
}

/** Public GET /listings max page size enforced by the API. */
export const PUBLIC_LISTINGS_PAGE_LIMIT = 48;

export type BrowsePublishedListingsFilters = {
  q?: string;
  limit?: number;
  page?: number;
};

/** Published (active) marketplace listings for buyer pickers. */
export function browsePublishedListings(
  filters: BrowsePublishedListingsFilters = {},
) {
  const limit = Math.min(
    filters.limit ?? PUBLIC_LISTINGS_PAGE_LIMIT,
    PUBLIC_LISTINGS_PAGE_LIMIT,
  );
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(filters.page ?? 1),
  });
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  return apiFetchPaginated<PublicListingSummary>('/listings', {
    searchParams: params,
  });
}
