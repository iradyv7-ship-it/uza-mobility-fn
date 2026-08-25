import { Suspense } from 'react';
import { GoogleCallback } from '@/components/auth/google-callback';
import { Spinner } from '@/components/ui/spinner';

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      }
    >
      <GoogleCallback />
    </Suspense>
  );
}
