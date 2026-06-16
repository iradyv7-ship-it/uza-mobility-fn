'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthFieldError } from '@/components/auth/auth-field-error';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { AuthFormMessage } from '@/components/auth/auth-form-message';
import { AuthPageHeader } from '@/components/auth/auth-page-header';
import { AuthPasswordInput } from '@/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import {
  authAccentLinkClassName,
  authFieldClassName,
  authFooterLinkClassName,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-styles';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { useRegister } from '@/queries/auth';
import { getAuthErrorMessage } from '@/lib/auth/auth-error-message';
import { getRegisterDefaultValues } from '@/lib/auth/register-default-values';
import {
  useAuthQueryReset,
  useClearAuthFeedbackOnChange,
} from '@/hooks/use-auth-form-lifecycle';
import { authRoutes } from '@/config/routes';

export function Register() {
  const registerMutation = useRegister();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const callbackUrl = searchParams.get('callbackUrl')?.trim() ?? '';
  const errorRef = useRef<HTMLDivElement>(null);
  const loginHref =
    callbackUrl.startsWith('/') && callbackUrl
      ? `${authRoutes.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : authRoutes.login;

  const defaultValues = useMemo(
    () => getRegisterDefaultValues(searchParams),
    [queryKey, searchParams],
  );

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });
  const { errors } = useFormState({ control: form.control });

  useAuthQueryReset(form, registerMutation, queryKey, defaultValues);
  useClearAuthFeedbackOnChange(form, registerMutation, [
    'email',
    'password',
    'firstName',
    'lastName',
    'phone',
  ]);

  const rootMessage =
    errors.root?.message ??
    (registerMutation.isError
      ? getAuthErrorMessage(
          registerMutation.error,
          'Unable to create account. Please try again.',
        )
      : null);

  useEffect(() => {
    if (rootMessage) {
      errorRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [rootMessage]);

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root');
    registerMutation.reset();
    registerMutation.mutate(values, {
      onError: (error) => {
        form.setError('root', {
          message: getAuthErrorMessage(
            error,
            'Unable to create account. Please try again.',
          ),
        });
      },
    });
  });

  const emailInUse = rootMessage?.toLowerCase().includes('email already');

  return (
    <AuthFormCard>
      <div className="space-y-4">
        <AuthPageHeader
          title="Create your account"
          description="Track inquiries and save vehicles."
        />

        <form onSubmit={onSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className={authFieldClassName}>
              <Label htmlFor="firstName" className={authLabelClassName}>
                First name
              </Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                className={authInputClassName}
                aria-invalid={Boolean(errors.firstName)}
                {...form.register('firstName')}
              />
              <AuthFieldError message={errors.firstName?.message} />
            </div>
            <div className={authFieldClassName}>
              <Label htmlFor="lastName" className={authLabelClassName}>
                Last name
              </Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                className={authInputClassName}
                aria-invalid={Boolean(errors.lastName)}
                {...form.register('lastName')}
              />
              <AuthFieldError message={errors.lastName?.message} />
            </div>
          </div>

          <div className={authFieldClassName}>
            <Label htmlFor="email" className={authLabelClassName}>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              className={authInputClassName}
              aria-invalid={Boolean(errors.email)}
              {...form.register('email')}
            />
            <AuthFieldError message={errors.email?.message} />
          </div>

          <div className={authFieldClassName}>
            <Label htmlFor="phone" className={authLabelClassName}>
              Phone (optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={authInputClassName}
              aria-invalid={Boolean(errors.phone)}
              {...form.register('phone')}
            />
            <AuthFieldError message={errors.phone?.message} />
          </div>

          <div className={authFieldClassName}>
            <Label htmlFor="password" className={authLabelClassName}>
              Password
            </Label>
            <AuthPasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Enter password"
              aria-invalid={Boolean(errors.password)}
              {...form.register('password')}
            />
            <AuthFieldError message={errors.password?.message} />
          </div>

          {rootMessage ? (
            <div ref={errorRef}>
              <AuthFormMessage variant="error" message={rootMessage}>
                {emailInUse ? (
                  <p className="text-sm text-red-800/90">
                    <Link
                      href={`${authRoutes.login}?email=${encodeURIComponent(form.getValues('email'))}${callbackUrl.startsWith('/') ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                      className="font-medium underline underline-offset-2"
                    >
                      Sign in with this email
                    </Link>
                    {' · '}
                    Try Google sign-in below if you used that before
                  </p>
                ) : null}
              </AuthFormMessage>
            </div>
          ) : null}

          <div className="space-y-2">
            <AuthPrimaryButton
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? 'Creating account…'
                : 'Create account'}
            </AuthPrimaryButton>
            <GoogleSignInButton
              disabled={registerMutation.isPending}
              returnTo={callbackUrl.startsWith('/') ? callbackUrl : undefined}
              onError={(message) => form.setError('root', { message })}
            />
          </div>
        </form>

        <p className={authFooterLinkClassName}>
          Already have an account?{' '}
          <Link href={loginHref} className={authAccentLinkClassName}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthFormCard>
  );
}
