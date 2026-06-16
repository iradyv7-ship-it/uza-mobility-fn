'use client';

import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { AuthFormMessage } from '@/components/auth/auth-form-message';
import { AuthPageHeader } from '@/components/auth/auth-page-header';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { resendVerificationByEmail } from '@/lib/api/auth';
import { getAuthErrorMessage } from '@/lib/auth/auth-error-message';
import { authRoutes } from '@/config/routes';

type CheckEmailFormProps = {
  email: string;
  callbackUrl?: string;
  linkedExistingAccount?: boolean;
};

export function CheckEmailForm({
  email,
  callbackUrl,
  linkedExistingAccount = false,
}: CheckEmailFormProps) {
  const loginHref = (() => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (callbackUrl) params.set('callbackUrl', callbackUrl);
    const query = params.toString();
    return query ? `${authRoutes.login}?${query}` : authRoutes.login;
  })();
  const resend = useMutation({
    mutationFn: () => resendVerificationByEmail(email),
  });

  return (
    <AuthFormCard>
      <div className="space-y-8">
        <AuthPageHeader
          title="Check your email"
          description={
            linkedExistingAccount
              ? email
                ? `We sent a password setup link to ${email}. Use it to sign in with email and password, or continue with Google using the same address. Your previous inquiries will appear in your account.`
                : 'We sent a password setup link to your email. Use it to sign in with email and password, or continue with Google.'
              : email
                ? `We sent a verification link to ${email}. Open it to activate your account, then sign in.`
                : 'We sent a verification link to your email. Open it to activate your account, then sign in.'
          }
        />

        {email && !linkedExistingAccount ? (
          <AuthPrimaryButton
            type="button"
            disabled={resend.isPending}
            onClick={() => resend.mutate()}
          >
            {resend.isPending ? 'Sending…' : 'Resend verification email'}
          </AuthPrimaryButton>
        ) : null}

        {resend.isSuccess ? (
          <AuthFormMessage variant="success" message={resend.data.message} />
        ) : null}
        {resend.isError ? (
          <AuthFormMessage
            variant="error"
            message={getAuthErrorMessage(
              resend.error,
              'Unable to resend verification email.',
            )}
          />
        ) : null}

        <p className="text-center text-base text-[#5D6772]">
          Back to{' '}
          <Link
            href={loginHref}
            className="font-medium text-[#046A38] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthFormCard>
  );
}
