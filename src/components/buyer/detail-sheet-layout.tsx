'use client';

import type { ReactNode } from 'react';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function BuyerDetailSheetHeader({
  title,
  description,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <SheetHeader className="border-b border-[#E9E9E9] px-6 py-5">
      <SheetTitle className="text-xl font-semibold text-[#151515]">
        {title}
      </SheetTitle>
      {description ? (
        <SheetDescription className="text-[#5D6772]">
          {description}
        </SheetDescription>
      ) : null}
      {meta ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>
      ) : null}
    </SheetHeader>
  );
}

export function BuyerDetailSheetBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-5 px-6 py-6', className)}>{children}</div>;
}

export function BuyerDetailSheetFooter({ children }: { children: ReactNode }) {
  return (
    <SheetFooter className="border-t border-[#E9E9E9] bg-[#FAFAFA] px-6 py-4 sm:flex-row sm:justify-start">
      {children}
    </SheetFooter>
  );
}

type SummaryItem = {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
};

export function BuyerDetailSummary({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-4 rounded-xl border border-[#E9E9E9] bg-[#F4FAF7] p-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-xs font-medium text-[#356769]">{item.label}</p>
          <p
            className={cn(
              'mt-1 break-words text-[#151515]',
              item.emphasis ? 'text-lg font-semibold' : 'text-sm font-medium',
            )}
          >
            {item.value ?? '—'}
          </p>
        </div>
      ))}
    </div>
  );
}

export function BuyerDetailCallout({
  children,
  variant = 'muted',
}: {
  children: ReactNode;
  variant?: 'muted' | 'destructive' | 'info';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 text-sm',
        variant === 'muted' && 'border-[#E9E9E9] bg-[#FAFAFA] text-[#5D6772]',
        variant === 'destructive' &&
          'border-destructive/30 bg-destructive/5 text-destructive',
        variant === 'info' && 'border-[#C5E8D8] bg-[#F4FAF7] text-[#174438]',
      )}
    >
      {children}
    </div>
  );
}
