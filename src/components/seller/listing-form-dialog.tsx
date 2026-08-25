'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { PricingBreakdown } from '@/components/shared/pricing-breakdown';
import { useDebounce } from '@/hooks/use-debounce';
import { previewListingPricing } from '@/lib/api/seller';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExistingPhotosGrid } from '@/components/shared/existing-photos-grid';
import { PendingPhotoPicker } from '@/components/shared/pending-photo-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  NumberInput,
  numberRegisterOptions,
} from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { marketplaceMeSeller } from '@/lib/auth/seller-profiles';
import { sellerListingToFormValues } from '@/lib/seller/listing-form';
import {
  pendingPhotoFiles,
  revokePendingPhotos,
  type PendingPhoto,
} from '@/lib/pending-photos';
import { useSessionUser } from '@/hooks/session-user';
import {
  useCreateSellerListing,
  useSellerCategories,
  useUpdateSellerListing,
} from '@/queries/seller';
import {
  createSellerListingSchema,
  listingConditions,
  MAX_SELLER_LISTING_PHOTOS,
  sellerListingFormSchema,
  type SellerListingFormInput,
} from '@/schemas/seller';
import type { SellerListing } from '@/types/seller/marketplace';
import type { Category } from '@/types/catalog';

function vehicleCategories(categories: Category[] | undefined) {
  return (
    categories?.filter(
      (c) =>
        c.type !== 'EV_PARTS_ACCESSORIES' &&
        c.type !== 'EV_INFRASTRUCTURE_ENERGY',
    ) ?? []
  );
}

type ListingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: SellerListing | null;
};

export function SellerListingFormDialog({
  open,
  onOpenChange,
  listing = null,
}: ListingFormDialogProps) {
  const isEdit = Boolean(listing);
  const { user } = useSessionUser();
  const marketplaceProfile = marketplaceMeSeller(user);
  const create = useCreateSellerListing();
  const update = useUpdateSellerListing();
  const { data: categories } = useSellerCategories(open);
  const vehicleCats = useMemo(
    () => vehicleCategories(categories),
    [categories],
  );
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const existingPhotos = listing?.photos ?? [];
  const remainingPhotoSlots = Math.max(
    0,
    MAX_SELLER_LISTING_PHOTOS - existingPhotos.length - photos.length,
  );
  const busy = create.isPending || update.isPending;

  const defaultSellerType =
    marketplaceProfile?.sellerType === 'INTERNATIONAL_SELLER'
      ? 'INTERNATIONAL_SELLER'
      : 'LOCAL_SELLER';

  const form = useForm<SellerListingFormInput>({
    resolver: zodResolver(sellerListingFormSchema),
    defaultValues: {
      sellerType: defaultSellerType,
      listingTitle: '',
      categoryId: '',
      brand: '',
      model: '',
      trim: '',
      manufacturingYear: new Date().getFullYear(),
      condition: 'NEW',
      vehicleLocation: '',
      city: 'Kigali',
      country: 'RW',
      description: '',
    },
  });

  const sellerType = form.watch('sellerType');
  const condition = form.watch('condition');
  const payout = form.watch('sellerDesiredPayoutRwf');
  const fob = form.watch('fobPriceRwf');
  const country = form.watch('country');
  const debouncedPayout = useDebounce(payout, 400);
  const debouncedFob = useDebounce(fob, 400);
  const categoryId = form.watch('categoryId');

  const pricingPreview = useQuery({
    queryKey: [
      'seller',
      'listing-pricing-preview',
      sellerType,
      debouncedPayout,
      debouncedFob,
      country,
    ],
    queryFn: () =>
      previewListingPricing({
        country,
        sellerDesiredPayoutRwf:
          sellerType === 'LOCAL_SELLER' ? debouncedPayout : undefined,
        fobPriceRwf:
          sellerType === 'INTERNATIONAL_SELLER' ? debouncedFob : undefined,
      }),
    enabled:
      open &&
      ((sellerType === 'LOCAL_SELLER' &&
        debouncedPayout != null &&
        debouncedPayout > 0) ||
        (sellerType === 'INTERNATIONAL_SELLER' &&
          debouncedFob != null &&
          debouncedFob > 0)),
  });
  useEffect(() => {
    if (!open) return;
    setPhotos((current) => {
      revokePendingPhotos(current);
      return [];
    });
    if (listing) {
      form.reset(sellerListingToFormValues(listing));
    } else {
      form.reset({
        sellerType: defaultSellerType,
        listingTitle: '',
        categoryId: '',
        brand: '',
        model: '',
        trim: '',
        manufacturingYear: new Date().getFullYear(),
        condition: 'NEW',
        vehicleLocation: '',
        city: marketplaceProfile?.city ?? 'Kigali',
        country: marketplaceProfile?.country ?? 'RW',
        description: '',
      });
    }
  }, [open, listing, form, defaultSellerType, marketplaceProfile]);

  const onSubmit = form.handleSubmit((values) => {
    const newPhotos = pendingPhotoFiles(photos);

    if (!isEdit && newPhotos.length < 1) {
      toast.error('Add at least one photo before saving.');
      return;
    }

    if (isEdit && listing) {
      const totalAfter = existingPhotos.length + newPhotos.length;
      if (totalAfter < 1) {
        toast.error('At least one photo is required.');
        return;
      }
      update.mutate(
        {
          id: listing.id,
          body: createSellerListingSchema.parse(values),
          photos: newPhotos,
        },
        {
          onSuccess: () => {
            revokePendingPhotos(photos);
            setPhotos([]);
            onOpenChange(false);
          },
        },
      );
      return;
    }

    create.mutate(
      {
        body: createSellerListingSchema.parse(values),
        photos: newPhotos,
      },
      {
        onSuccess: () => {
          revokePendingPhotos(photos);
          setPhotos([]);
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit listing' : 'New vehicle listing'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Listings are saved as drafts. Submit for administrator review when
          ready — UZA will publish after approval.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Seller type</Label>
            <Select
              value={sellerType}
              disabled={isEdit}
              onValueChange={(value) =>
                form.setValue(
                  'sellerType',
                  value as SellerListingFormInput['sellerType'],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOCAL_SELLER">Local seller</SelectItem>
                <SelectItem value="INTERNATIONAL_SELLER">
                  International seller
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title</Label>
            <Input id="listing-title" {...form.register('listingTitle')} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                form.setValue('categoryId', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {vehicleCats.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...form.register('brand')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...form.register('model')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <NumberInput
                id="year"
                {...form.register('manufacturingYear', numberRegisterOptions())}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <p className="text-xs text-muted-foreground">
                Select <span className="font-medium">New</span> for a
                factory-new vehicle; other options are pre-owned.
              </p>
              <Select
                value={form.watch('condition')}
                onValueChange={(value) =>
                  form.setValue(
                    'condition',
                    value as SellerListingFormInput['condition'],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listingConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <NumberInput
                id="mileage"
                min={0}
                {...form.register('mileageKm', numberRegisterOptions())}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="range">Electric range (km)</Label>
              <NumberInput
                id="range"
                min={1}
                {...form.register('rangeKm', numberRegisterOptions())}
              />
            </div>
          </div>

          {condition !== 'NEW' ? (
            <div className="space-y-1.5">
              <Label htmlFor="battery-health">Battery health (%)</Label>
              <NumberInput
                id="battery-health"
                min={0}
                max={100}
                {...form.register(
                  'batteryHealthPercent',
                  numberRegisterOptions(),
                )}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Vehicle location</Label>
              <Input id="location" {...form.register('vehicleLocation')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register('city')} />
            </div>
          </div>

          {sellerType === 'LOCAL_SELLER' ? (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="payout">Desired payout after sale (Rwf)</Label>
                <p className="text-xs text-muted-foreground">
                  Amount you want to receive; platform fees are added for the
                  buyer price shown on the marketplace.
                </p>
                <NumberInput
                  id="payout"
                  min={0}
                  step="1"
                  {...form.register(
                    'sellerDesiredPayoutRwf',
                    numberRegisterOptions(),
                  )}
                />
                {form.formState.errors.sellerDesiredPayoutRwf ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.sellerDesiredPayoutRwf.message}
                  </p>
                ) : null}
              </div>
              <PricingBreakdown
                breakdown={pricingPreview.data}
                loading={pricingPreview.isFetching}
                sellerType="LOCAL_SELLER"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="fob-price">FOB price (Rwf)</Label>
                <p className="text-xs text-muted-foreground">
                  Free-on-board cost; shipping, taxes, and platform margin are
                  added for the buyer price.
                </p>
                <NumberInput
                  id="fob-price"
                  min={0}
                  step="1"
                  {...form.register('fobPriceRwf', numberRegisterOptions())}
                />
                {form.formState.errors.fobPriceRwf ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fobPriceRwf.message}
                  </p>
                ) : null}
              </div>
              <PricingBreakdown
                breakdown={pricingPreview.data}
                loading={pricingPreview.isFetching}
                sellerType="INTERNATIONAL_SELLER"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="listing-desc">Description</Label>
            <Textarea
              id="listing-desc"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {isEdit && existingPhotos.length > 0 ? (
            <ExistingPhotosGrid
              photos={existingPhotos}
              hint={`${existingPhotos.length} photo(s) on listing. Add more below.`}
            />
          ) : null}

          <PendingPhotoPicker
            photos={photos}
            onChange={setPhotos}
            maxPhotos={isEdit ? remainingPhotoSlots : MAX_SELLER_LISTING_PHOTOS}
            label={isEdit ? 'Add photos' : 'Listing photos'}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
