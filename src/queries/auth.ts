'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useAppRouter } from '@/lib/navigation/use-app-router';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from '@/lib/api/auth';
import { authenticatedFetch } from '@/lib/api/authenticated';
import { ApiClientError } from '@/lib/api';
import { authRoutes } from '@/config/routes';
import { signInWithSession } from '@/lib/auth/sign-in';
import { resolvePostLoginRedirect } from '@/lib/auth/redirect';
import { normalizeMeUser } from '@/lib/auth/seller-profiles';
import { signOutClient } from '@/lib/auth/sign-out-client';
import { clearUserSessionQueries } from '@/lib/query/clear-user-session';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@/schemas/auth';
import type { MeUser } from '@/types/auth/me-user';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLogin() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const tokens = await login(input);
      const me = normalizeMeUser(await getMe(tokens.accessToken));

      const result = await signInWithSession({
        ...tokens,
        email: input.email,
        password: input.password,
      });

      if (!result || result.error) {
        throw new ApiClientError(
          'Unable to start session after login. Please try again.',
          500,
        );
      }

      return me;
    },
    onSuccess: async (me) => {
      clearUserSessionQueries(queryClient);

      router.replace(
        resolvePostLoginRedirect(me, searchParams.get('callbackUrl')),
      );
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useAppRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (response) => {
      const params = new URLSearchParams({ email: response.email });
      if (response.linkedExistingAccount) {
        params.set('linked', '1');
      }
      const callbackUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('callbackUrl')
          : null;
      if (callbackUrl?.startsWith('/')) {
        params.set('callbackUrl', callbackUrl);
      }
      router.replace(`${authRoutes.checkEmail}?${params.toString()}`);
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useAppRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (session?.refreshToken) {
        try {
          await logout(session.refreshToken);
        } catch {
          // Still sign out locally if API logout fails
        }
      }
    },
    onSettled: async () => {
      await signOutClient({ queryClient, redirect: false });
      router.replace(authRoutes.login);
      router.refresh();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input.email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      resetPassword({ token: input.token, password: input.password }),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(input.token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useMe() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () =>
      normalizeMeUser(
        await authenticatedFetch<MeUser>('/auth/me', { token: accessToken }),
      ),
    enabled:
      status === 'authenticated' &&
      Boolean(accessToken) &&
      session?.error !== 'RefreshAccessTokenError',
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
