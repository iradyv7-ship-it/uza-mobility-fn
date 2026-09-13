import { AlertTriangle, Info, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WalletWarnings } from '@/types/buyer/wallet';

/**
 * A warning the driver sees before their lender does — or at the same moment, never after.
 * The button is the whole point of module 2.8: call before you miss, not after.
 */
export function CovenantBanner({ warnings }: { warnings: WalletWarnings }) {
  const alert = warnings.worst === 'ALERT';
  const Icon = warnings.worst === 'NOTICE' ? Info : AlertTriangle;
  return (
    <div
      role={alert ? 'alert' : 'status'}
      className={`rounded-lg border p-4 ${alert ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}`}
    >
      <div className="flex gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${alert ? 'text-destructive' : 'text-amber-600'}`} aria-hidden />
        <div className="flex-1 space-y-2">
          {warnings.covenants.map((c) => (
            <p key={c.kind} className="text-sm">
              {c.message}
            </p>
          ))}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild size="sm" variant={alert ? 'destructive' : 'default'}>
              <a href="tel:+250788371081">
                <PhoneCall className="size-4" aria-hidden />
                Hamagara mbere yo gusiba · Call before you miss
              </a>
            </Button>
            <span className="text-xs text-muted-foreground">
              Guhamagara nta kibazo. Calling now keeps this a conversation; nothing bad happens for calling.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
