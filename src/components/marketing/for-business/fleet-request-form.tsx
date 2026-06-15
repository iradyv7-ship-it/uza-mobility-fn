'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { brand } from '@/lib/marketing/colors';
import { VEHICLE_CATEGORY_TYPES_FOR_FLEET } from '@/lib/marketing/for-business';
import {
  NumberInput,
  numberRegisterOptions,
} from '@/components/ui/number-input';
import { useSubmitFleetRequest } from '@/queries/fleet';
import {
  fleetRequestSchema,
  type FleetRequestInput,
} from '@/schemas/fleet-request';
import type { Category } from '@/types/catalog';

type FleetRequestFormProps = {
  categories: Category[];
};

const EMPTY_FORM_VALUES: FleetRequestInput = {
  contactPerson: '',
  email: '',
  organizationName: '',
  phoneCountryCode: '+250',
  phoneNumber: '',
  vehicleCategoryId: '',
  quantity: 1,
  notes: '',
};

export function FleetRequestForm({ categories }: FleetRequestFormProps) {
  const submit = useSubmitFleetRequest();

  const vehicleCategories = categories
    .filter((category) =>
      VEHICLE_CATEGORY_TYPES_FOR_FLEET.includes(
        category.type as (typeof VEHICLE_CATEGORY_TYPES_FOR_FLEET)[number],
      ),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const form = useForm<FleetRequestInput>({
    resolver: zodResolver(fleetRequestSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  const onSubmit = form.handleSubmit((values) => {
    const phone = `${values.phoneCountryCode} ${values.phoneNumber}`.trim();

    submit.mutate(
      {
        organizationName: values.organizationName,
        contactPerson: values.contactPerson,
        phone,
        email: values.email,
        buyerType: 'BUSINESS',
        vehicleCategoryId: values.vehicleCategoryId,
        quantity: values.quantity,
        notes: values.notes,
      },
      {
        onSuccess: (result) => {
          form.reset(EMPTY_FORM_VALUES);
          toast.success(
            `Request sent (${result.referenceNumber}). Check your email for a summary — our team will respond within 24 hours.`,
          );
        },
      },
    );
  });

  return (
    <div
      id="fleet-form"
      className="scroll-mt-28 overflow-hidden rounded-2xl bg-[#fffefc] shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
    >
      <div
        className="flex items-center justify-between gap-4 px-6 py-8 sm:px-8"
        style={{ backgroundColor: brand.forest }}
      >
        <h3 className="text-2xl font-semibold text-[#fffefc] sm:text-[28px]">
          Start Your Transition.
        </h3>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        <p className="max-w-xl text-base leading-relaxed text-[#2c2c2c]">
          Tell us about your operational needs. We respond with a tailored
          sourcing and infrastructure strategy within 24 hours.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Full Name</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., Jane Doe"
                aria-invalid={Boolean(form.formState.errors.contactPerson)}
                {...form.register('contactPerson')}
              />
              {form.formState.errors.contactPerson ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.contactPerson.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., name@company.com"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Company Name</Label>
              <Input
                id="organizationName"
                placeholder="e.g., Kigali Transit Ltd."
                aria-invalid={Boolean(form.formState.errors.organizationName)}
                {...form.register('organizationName')}
              />
              {form.formState.errors.organizationName ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.organizationName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex overflow-hidden rounded-md border border-[#e9e9e9]">
                <Input
                  id="phoneCountryCode"
                  placeholder="+250"
                  aria-label="Country code"
                  className="w-[56px] shrink-0 rounded-none border-0 border-r border-[#e9e9e9] bg-[#fffefc] shadow-none focus-visible:ring-0"
                  aria-invalid={Boolean(form.formState.errors.phoneCountryCode)}
                  {...form.register('phoneCountryCode')}
                />
                <Input
                  id="phoneNumber"
                  placeholder="788 000 000"
                  className="rounded-none border-0 shadow-none focus-visible:ring-0"
                  aria-invalid={Boolean(form.formState.errors.phoneNumber)}
                  {...form.register('phoneNumber')}
                />
              </div>
              {form.formState.errors.phoneCountryCode ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phoneCountryCode.message}
                </p>
              ) : null}
              {form.formState.errors.phoneNumber ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phoneNumber.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fleet-quantity">Number of vehicles</Label>
              <NumberInput
                id="fleet-quantity"
                min={1}
                step={1}
                placeholder="e.g. 12"
                aria-invalid={Boolean(form.formState.errors.quantity)}
                {...form.register('quantity', numberRegisterOptions())}
              />
              <p className="text-xs text-[#356769]">
                Enter the exact number of vehicles you need.
              </p>
              {form.formState.errors.quantity ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Primary Use Case</Label>
              <Select
                value={form.watch('vehicleCategoryId')}
                onValueChange={(value) =>
                  form.setValue('vehicleCategoryId', value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select vehicle type..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.vehicleCategoryId ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.vehicleCategoryId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Your Message / Specific Requirements</Label>
            <Textarea
              id="notes"
              rows={5}
              placeholder="Tell us about your timeline, desired vehicle models, or specific charging needs..."
              aria-invalid={Boolean(form.formState.errors.notes)}
              {...form.register('notes')}
            />
          </div>

          <Button
            type="submit"
            disabled={submit.isPending}
            className="h-12 rounded-full px-6 text-sm font-semibold text-white"
            style={{ backgroundColor: brand.forest }}
          >
            {submit.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </div>
    </div>
  );
}
