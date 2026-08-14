// app/dashboard/facility/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  createServiceSchema,
  type CreateServiceFormInput,
  type CreateServiceFormValues,
} from '@/lib/validations/service';
import { createService, getFacilityServicesById, getMyFacilities } from '@/services/facilities';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FACILITY_CATEGORIES, type FacilityResponseDTO, type Service } from '@slotbook/shared/facilities';
import { formatPrice } from '@/lib/utils';

function generateCategoryObj() {
  const obj: Array<{ label: string; value: string | null }> = [
    { label: 'Select category', value: null },
  ];

  for (const key of FACILITY_CATEGORIES) {
    obj.push({ label: key, value: key });
  }
  return obj;
}
export default function FacilityDashboardPage() {
  const [facilities, setFacilities] = useState<FacilityResponseDTO[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const categoriesObj = generateCategoryObj();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceFormInput, unknown, CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { currency: 'PLN', category: '' },
  });

  useEffect(() => {
    getMyFacilities()
      .then((data: FacilityResponseDTO[] | null) => {
        if (data === null) {
          setFacilities([]);
          setSelectedFacilityId(null);
          return;
        }
        setFacilities(data);
        setSelectedFacilityId(data[0]?.id);
      })
      .finally(() => setIsLoadingFacilities(false));
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) return;

    setIsLoadingServices(true);
    getFacilityServicesById(selectedFacilityId)
      .then(setServices)
      .finally(() => setIsLoadingServices(false));
  }, [selectedFacilityId]);

  const onSubmit = async (values: CreateServiceFormValues) => {
    if (!selectedFacilityId) return;
    console.log(values);
    setServerError(null);
    try {
      const service = await createService(selectedFacilityId, values);
      setServices((prev) => [...prev, service]);
      reset();
    } catch {
      setServerError('Не удалось создать услугу. Попробуйте позже.');
    }
  };

  if (isLoadingFacilities) {
    return <p className="p-14 text-center text-sm text-muted-foreground">Загрузка...</p>;
  }

  if (facilities.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          У вас пока нет заведений. Создайте одно, чтобы добавлять услуги.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="font-(family-name:--font-geist-mono) text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Дашборд владельца
      </p>
      <h1 className="mt-3 font-heading text-3xl font-medium text-foreground">Ваши заведения</h1>

      {facilities.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {facilities.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFacilityId(f.id)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                f.id === selectedFacilityId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-heading text-xl font-medium text-foreground">Услуги</h2>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {isLoadingServices && (
          <p className="p-6 text-center text-sm text-muted-foreground">Загрузка...</p>
        )}

        {!isLoadingServices && services.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">Услуг пока нет</p>
        )}

        {services.map((service) => (
          <div key={service.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-card-foreground">{service.name}</p>
              <p className="mt-1 font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
                {service.durationMinutes} мин
              </p>
            </div>
            <p className="shrink-0 font-medium text-foreground">
              {formatPrice(service.priceCents, service.currency)}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-heading text-xl font-medium text-foreground">Добавить услугу</h2>

      <form
        key={selectedFacilityId}
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-5"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Название</Label>
          <Input
            id="name"
            type="text"
            placeholder="Классический массаж спины"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Описание</Label>
          <Input
            id="description"
            type="text"
            placeholder="Необязательно"
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes">Длительность (мин)</Label>
            <Input
              id="durationMinutes"
              type="number"
              placeholder="60"
              aria-invalid={!!errors.durationMinutes}
              {...register('durationMinutes')}
            />
            {errors.durationMinutes && (
              <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priceCents">Цена (в центах)</Label>
            <Input
              id="priceCents"
              type="number"
              placeholder="15000"
              aria-invalid={!!errors.priceCents}
              {...register('priceCents')}
            />
            {errors.priceCents && (
              <p className="text-xs text-destructive">{errors.priceCents.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Категория</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="category"
                  className="w-full max-w-48"
                  aria-invalid={!!errors.category}
                >
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categoriesObj.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Добавить услугу <Plus className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
