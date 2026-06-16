import Image from 'next/image';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export function BuyerDetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-[#E9E9E9] bg-white p-4 sm:p-5',
        className,
      )}
    >
      <h3 className="mb-4 text-xs font-semibold tracking-wide text-[#356769] uppercase">
        {title}
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export function BuyerDetailRow({
  label,
  value,
  className,
  fullWidth,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn('min-w-0', fullWidth && 'sm:col-span-2', className)}>
      <dt className="text-xs text-[#5D6772]">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-[#151515]">
        {value ?? '—'}
      </dd>
    </div>
  );
}

export function BuyerDetailNote({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-[#356769] uppercase">
        {title}
      </p>
      <p className="mt-2 text-sm whitespace-pre-wrap text-[#5D6772]">
        {children}
      </p>
    </div>
  );
}

export function BuyerDetailProofGrid({
  title = 'Payment proofs',
  proofs,
  isImageProof,
}: {
  title?: string;
  proofs: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileType?: string;
  }>;
  isImageProof: (fileNameOrType: string) => boolean;
}) {
  if (proofs.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-4 sm:p-5">
      <p className="mb-3 text-xs font-semibold tracking-wide text-[#356769] uppercase">
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {proofs.map((proof) => {
          const imageKey = proof.fileType ?? proof.fileName;
          return (
            <li
              key={proof.id}
              className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#E9E9E9] bg-[#FAFAFA]"
            >
              {isImageProof(imageKey) ? (
                <a
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block size-full"
                >
                  <Image
                    src={proof.fileUrl}
                    alt={proof.fileName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 180px"
                    unoptimized
                  />
                </a>
              ) : (
                <a
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-full flex-col items-center justify-center gap-1 p-3 text-center text-xs text-[#046A38] underline"
                >
                  <span className="font-medium uppercase">
                    {proof.fileType ??
                      proof.fileName.split('.').pop()?.toUpperCase()}
                  </span>
                  <span className="line-clamp-2">{proof.fileName}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type TrackingEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  occurredAt: string;
  stage?: string;
};

export function BuyerDetailTracking({
  events,
  isLoading,
}: {
  events?: TrackingEvent[];
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-4 sm:p-5">
      <p className="mb-4 text-xs font-semibold tracking-wide text-[#356769] uppercase">
        Tracking
      </p>
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : events?.length ? (
        <ol className="space-y-0">
          {events.map((event) => (
            <li
              key={event.id}
              className="relative border-l-2 border-[#C5E8D8] py-4 pl-5 last:pb-0"
            >
              <span className="absolute top-4 -left-[7px] size-3 rounded-full bg-[#046A38]" />
              <p className="text-sm font-medium text-[#151515]">
                {event.title}
              </p>
              {event.description ? (
                <p className="mt-1 text-sm text-[#5D6772]">
                  {event.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-[#5D6772]">
                {formatDateTime(event.occurredAt)}
                {event.stage ? ` · ${event.stage.replaceAll('_', ' ')}` : ''}
                {event.location ? ` · ${event.location}` : ''}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[#5D6772]">No tracking updates yet.</p>
      )}
    </div>
  );
}
