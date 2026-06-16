import { CheckEmailForm } from '@/components/auth/check-email-form';

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    callbackUrl?: string;
    linked?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email = '', callbackUrl = '', linked = '' } = await searchParams;

  return (
    <CheckEmailForm
      email={email}
      callbackUrl={callbackUrl.startsWith('/') ? callbackUrl : undefined}
      linkedExistingAccount={linked === '1'}
    />
  );
}
