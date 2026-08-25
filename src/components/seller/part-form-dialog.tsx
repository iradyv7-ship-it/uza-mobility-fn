'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PricingBreakdown } from '@/components/shared/pricing-breakdown';
import { useDebounce } from '@/hooks/use-debounce';
import { previewPartPricing } from '@/lib/api/seller';
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
import {
  pendingPhotoFiles,
  revokePendingPhotos,
  type PendingPhoto,
} from '@/lib/pending-photos';
import {
  useCreateSellerPart,
  useSellerCategories,
  useUpdateSellerPart,
} from '@/queries/seller';
import {
  createPartSchema,
  MAX_PART_PHOTOS,
  partConditions,
  type CreatePartInput,
} from '@/schemas/seller';
import type { Category } from '@/types/catalog';
import type { SellerPart } from '@/types/seller/marketplace';

const PARTS_CATEGORY_TYPE = 'EV_PARTS_ACCESSORIES' as const;

function partCategoryOptions(categories: Category[] | undefined) {
  const partsCategory = categories?.find((c) => c.type === PARTS_CATEGORY_TYPE);
  if (!partsCategory?.subcategories?.length) return [];

  return [...partsCategory.subcategories]
    .filter((sub) => sub.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((sub) => ({ value: sub.slug, label: sub.name }));
}

function resolveStoredCategorySlug(
  stored: string | undefined,
  options: { value: string; label: string }[],
) {
  if (!stored?.trim()) return '';
  const normalized = stored.trim().toLowerCase();
  const exact = options.find(
    (o) => o.value === stored || o.value === normalized,
  );
  if (exact) return exact.value;

  const suffix = options.find(
    (o) =>
      o.value === normalized ||
      o.value.endsWith(`-${normalized}`) ||
      o.label.toLowerCase() === normalized,
  );
  if (suffix) return suffix.value;

  return options.some((o) => o.value === stored) ? stored : '';
}

type PartFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part?: SellerPart | null;
};

export function SellerPartFormDialog({
  open,
  onOpenChange,
  part,
}: PartFormDialogProps) {
  const isEdit = Boolean(part);
  const create = useCreateSellerPart();
  const update = useUpdateSellerPart();
  const { data: categories } = useSellerCategories(open);
  const categoryOptions = useMemo(
    () => partCategoryOptions(categories),
    [categories],
  );
  const busy = create.isPending || update.isPending;
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const existingPhotos = part?.photos ?? [];
  const remainingPhotoSlots = Math.max(
    0,
    MAX_PART_PHOTOS - existingPhotos.length,
  );

  const form = useForm<CreatePartInput>({
    resolver: zodResolver(createPartSchema),
    defaultValues: {
      name: '',
      categorySlug: '',
      condition: 'NEW',
      priceUsd: 0,
      stockQuantity: 0,
      description: '',
      deliveryEstimate: '',
    },
  });

  const categorySlug = form.watch('categorySlug');

  useEffect(() => {
    if (!open) return;
    setPhotos((current) => {
      revokePendingPhotos(current);
      return [];
    });
    if (part) {
      form.reset({
        name: part.name,
        categorySlug: resolveStoredCategorySlug(
          part.categorySlug,
          categoryOptions,
        ),
        condition: part.condition as CreatePartInput['condition'],
        priceUsd: part.priceUsd,
        stockQuantity: part.stockQuantity,
        description: part.description ?? '',
        deliveryEstimate: part.deliveryEstimate ?? '',
      });
    } else {
      form.reset({
        name: '',
        categorySlug: '',
        condition: 'NEW',
        priceUsd: 0,
        stockQuantity: 0,
        description: '',
        deliveryEstimate: '',
      });
    }
  }, [open, part, form, categoryOptions]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      description: values.description?.trim() || undefined,
      deliveryEstimate: values.deliveryEstimate?.trim() || undefined,
    };

    if (isEdit && part) {
      update.mutate(
        { id: part.id, body: payload, photos: pendingPhotoFiles(photos) },
        {
          onSuccess: () => {
            revokePendingPhotos(photos);
            setPhotos([]);
            onOpenChange(false);
          },
        },
      );
    } else {
      create.mutate(
        { body: payload, photos: pendingPhotoFiles(photos) },
        {
          onSuccess: () => {
            revokePendingPhotos(photos);
            setPhotos([]);
            onOpenChange(false);
          },
        },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit part' : 'New part listing'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="part-name">Name</Label>
            <Input id="part-name" {...form.register('name')} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categorySlug || undefined}
              onValueChange={(value) =>
                form.setValue('categorySlug', value, { shouldValidate: true })
              }
              disabled={categoryOptions.length === 0}
            >
              <SelectTrigger id="part-category">
                <SelectValue
                  placeholder={
                    categoryOptions.length === 0
                      ? 'No part categories configured'
                      : 'Select category'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <Select
                value={form.watch('condition')}
                onValueChange={(value) =>
                  form.setValue(
                    'condition',
                    value as CreatePartInput['condition'],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partConditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="part-stock">Stock</Label>
              <NumberInput
                id="part-stock"
                min={0}
                {...form.register('stockQuantity', numberRegisterOptions())}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="part-price">
                Desired payout after sale (USD)
              </Label>
              <p className="text-xs text-muted-foreground">
                Buyer list price includes platform commission (same estimate as
                local vehicle listings).
              </p>
              <NumberInput
                id="part-price"
                min={0}
                step="0.01"
                {...form.register('priceUsd', numberRegisterOptions())}
              />
            </div>
            <PartPricingPreview priceUsd={form.watch('priceUsd')} open={open} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="part-delivery">Delivery estimate</Label>
            <Input id="part-delivery" {...form.register('deliveryEstimate')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="part-desc">Description</Label>
            <Textarea
              id="part-desc"
              rows={3}
              {...form.register('description')}
            />
          </div>
          {isEdit && existingPhotos.length > 0 ? (
            <ExistingPhotosGrid
              photos={existingPhotos}
              hint={`${existingPhotos.length} of ${MAX_PART_PHOTOS} slots used`}
            />
          ) : null}
          <PendingPhotoPicker
            photos={photos}
            onChange={setPhotos}
            maxPhotos={isEdit ? remainingPhotoSlots : MAX_PART_PHOTOS}
            label={isEdit ? 'Add more photos' : 'Part photos'}
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
              {isEdit ? 'Save changes' : 'Create part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PartPricingPreview({
  priceUsd,
  open,
}: {
  priceUsd: number | undefined;
  open: boolean;
}) {
  const debounced = useDebounce(priceUsd, 400);
  const preview = useQuery({
    queryKey: ['seller', 'part-pricing-preview', debounced],
    queryFn: () => previewPartPricing({ desiredPayoutRwf: debounced! }),
    enabled: open && debounced != null && debounced > 0,
  });

  return (
    <PricingBreakdown
      breakdown={preview.data}
      loading={preview.isFetching}
      sellerType="LOCAL_SELLER"
    />
  );
}
