import { redirect } from 'next/navigation';

/**
 * The workshop looks parts up in the marketplace catalogue rather than in a second
 * inventory of its own.
 *
 * Two lists of what a part costs is how a mechanic quotes one price and the invoice
 * shows another. Until the workshop genuinely needs its own stock model, this sends
 * people to the one list that exists.
 */
export default function WorkshopPartsPage() {
  redirect('/spare-parts');
}
