import { normalizeAuthEmail } from '@/lib/auth/normalize-auth-email';
import { apiFetch } from './api';
import type { AuthTokens } from '@/types/auth/auth-tokens';
import type { MeUser } from '@/types/auth/me-user';
import type { LoginInput } from '@/schemas/auth';
import type { RegisterInput } from '@/schemas/auth';

export function login(input: LoginInput) {
  return apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      email: normalizeAuthEmail(input.email),
    }),
  });
}

export function completeGoogleSignIn(code: string) {
  return apiFetch<AuthTokens>('/auth/google/complete', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export type RegisterResponse = {
  message: string;
  email: string;
  linkedExistingAccount?: boolean;
};

export function register(input: RegisterInput) {
  const payload = {
    ...input,
    email: normalizeAuthEmail(input.email),
    phone: input.phone?.trim() ? input.phone.trim() : undefined,
  };

  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout(refreshToken: string) {
  await apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
    token: refreshToken,
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    token: refreshToken,
  });
}

/** Profile for a given access token (server / authorize). */
export function getMe(accessToken: string) {
  return apiFetch<MeUser>('/auth/me', { token: accessToken });
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeAuthEmail(email) }),
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function verifyEmail(token: string) {
  return apiFetch<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationByEmail(email: string) {
  return apiFetch<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeAuthEmail(email) }),
  });
}

export function resendVerificationForMe(accessToken: string) {
  return apiFetch<{ message: string }>('/auth/me/resend-verification', {
    method: 'POST',
    token: accessToken,
  });
}
