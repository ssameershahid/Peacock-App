import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  TOURS as MOCK_TOURS,
  VEHICLES as MOCK_VEHICLES,
  TRANSFERS as MOCK_TRANSFERS,
  POPULAR_ROUTES,
  BOOKINGS as MOCK_BOOKINGS,
  CYO_REQUESTS,
  DRIVER_BOOKINGS,
  DRIVER_PROFILE,
} from "@/lib/mock-data";

// ── Data normalizers ──────────────────────────────────────────────────────────

function normalizeTourList(tours: any[]) {
  return tours.map(t => ({
    ...t,
    title: t.name ?? t.title,
    images: t.heroImages ?? t.images ?? [],
    image: (t.heroImages ?? t.images ?? [])[0] ?? '',
    included: t.whatsIncluded ?? t.included ?? [],
    notIncluded: t.whatsNotIncluded ?? t.notIncluded ?? [],
    leadTimeDays: t.minLeadTimeDays ?? t.leadTimeDays ?? 3,
    vehicleRates: normalizeVehicleRates(t.vehicleRates),
    addOns: normalizeAddOns(t.addOns ?? []),
    itinerary: normalizeItinerary(t.itinerary ?? []),
  }));
}

function normalizeTour(t: any) {
  return normalizeTourList([t])[0];
}

function normalizeVehicleRates(rates: any): Record<string, number> {
  if (!rates) return {};
  if (Array.isArray(rates)) {
    return rates.reduce((acc: Record<string, number>, r: any) => {
      const key = r.vehicleType ?? r.type ?? r.id;
      acc[key] = r.pricePerDay ?? r.price ?? 0;
      return acc;
    }, {});
  }
  return rates; // already an object
}

function normalizeAddOns(addOns: any[]) {
  return addOns.map((a: any) => ({
    ...a,
    price: a.priceGBP ?? a.price ?? 0,
  }));
}

function normalizeItinerary(itinerary: any[]) {
  return itinerary.map((d: any) => ({
    day: d.dayNumber ?? d.day,
    title: d.title,
    location: d.location,
    lat: d.lat,
    lng: d.lng,
    description: d.description,
    drivingTime: d.drivingTime ?? '',
    stops: d.keyStops ?? d.stops ?? [],
  }));
}

function normalizeVehicles(vehicles: any[]) {
  return vehicles.map((v: any) => ({
    ...v,
    image: v.imageUrl ?? v.image ?? '',
    capacity: v.capacityMax ?? v.capacity ?? '',
    maxPassengers: v.capacityMax ?? v.maxPassengers ?? 35,
  }));
}

function minsToRange(mins: number): string {
  const h = mins / 60;
  if (h < 1) return `${mins} minutes`;
  const lo = Math.floor(h);
  const hi = Math.ceil(h * 1.25 * 2) / 2;
  return lo === hi ? `${lo} hours` : `${lo}–${hi} hours`;
}

function normalizeTransferRoutes(routes: any[]) {
  return routes.map((r: any) => {
    // Build prices map from fixedPrices array (API shape) or prices object (mock shape)
    let prices: Record<string, number> = r.prices ?? {};
    if (r.fixedPrices?.length) {
      prices = r.fixedPrices.reduce((acc: Record<string, number>, p: any) => {
        acc[p.vehicleType] = p.priceGBP ?? p.price ?? 0;
        return acc;
      }, {});
    }
    return {
      ...r,
      from: r.from ?? r.fromLocation ?? '',
      to: r.to ?? r.toLocation ?? '',
      distance: r.distance ?? (r.distanceKm ? `${r.distanceKm} km` : ''),
      time: r.time ?? (r.estimatedMins ? minsToRange(r.estimatedMins) : ''),
      price: r.price ?? prices['car'] ?? 0,
      prices,
    };
  });
}

function normalizeBooking(b: any) {
  const statusMap: Record<string, string> = {
    CONFIRMED: 'Upcoming',
    COMPLETED: 'Completed',
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    CANCELLED: 'Cancelled',
  };
  const rawDate = (v: any) => {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString().split('T')[0];
    if (typeof v === 'string') return v.includes('T') ? v.split('T')[0] : v;
    return v;
  };
  const total = b.totalGBP ?? b.totalAmountGBP ?? b.price ?? 0;
  const typeMap: Record<string, string> = { READY_MADE: 'tour', CUSTOM: 'custom', TRANSFER: 'transfer' };
  return {
    ...b,
    title: b.title ?? b.tourName ?? b.referenceCode ?? b.id,
    type: typeMap[b.type] ?? b.type ?? 'tour',
    startDate: rawDate(b.startDate),
    endDate: rawDate(b.endDate),
    status: statusMap[b.status] ?? b.status,
    vehicle: b.vehicleType ?? b.vehicle ?? '',
    price: total,
    totalGBP: total,
    pricing: b.pricing ?? b.pricingBreakdown ?? {
      vehicleTotal: total,
      addOnsTotal: 0,
      taxesAndFees: 0,
    },
    customer: b.customer ?? { name: 'Guest', email: '', phone: '' },
    driver: b.driver ?? null,
    passengers: b.numPassengers ?? b.passengers ?? 1,
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useTours() {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      try {
        const tours = await api.get<any[]>("/tours");
        const normalized = normalizeTourList(tours);
        return normalized.length > 0 ? normalized : normalizeTourList(MOCK_TOURS);
      } catch {
        return normalizeTourList(MOCK_TOURS);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: ["tours", slug],
    queryFn: async () => {
      try {
        const tour = await api.get<any>(`/tours/${slug}`);
        return normalizeTour(tour);
      } catch {
        const mock = MOCK_TOURS.find(t => t.slug === slug);
        if (!mock) throw new Error("Tour not found");
        return mock;
      }
    },
    enabled: !!slug,
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        const vehicles = await api.get<any[]>("/vehicles");
        const normalized = normalizeVehicles(vehicles);
        return normalized.length > 0 ? normalized : MOCK_VEHICLES;
      } catch {
        return MOCK_VEHICLES;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      try {
        const routes = await api.get<any[]>("/transfers");
        const normalized = normalizeTransferRoutes(routes);
        return normalized.length > 0 ? normalized : normalizeTransferRoutes(MOCK_TRANSFERS);
      } catch {
        return normalizeTransferRoutes(MOCK_TRANSFERS);
      }
    },
  });
}

export function usePopularRoutes() {
  return useQuery({
    queryKey: ["popular-routes"],
    queryFn: async () => POPULAR_ROUTES,
  });
}

export function useUserBookings() {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: async () => {
      try {
        const bookings = await api.get<any[]>("/bookings");
        return bookings.map(normalizeBooking);
      } catch (err: any) {
        if (err?.status === 401) return [];
        return MOCK_BOOKINGS;
      }
    },
  });
}

export function useBooking(id: string) {
  const isCYO = id.startsWith('CTR') || id.startsWith('CYO');
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => {
      try {
        const booking = await api.get<any>(`/bookings/${id}`);
        return normalizeBooking(booking);
      } catch {
        const mock = MOCK_BOOKINGS.find(b => b.id === id);
        if (!mock) throw new Error("Booking not found");
        return mock;
      }
    },
    enabled: !isCYO,
  });
}

export function useCYORequests() {
  return useQuery({
    queryKey: ["cyo-requests", "me"],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/custom-requests/mine");
      } catch (err: any) {
        if (err?.status === 401) return [];
        return CYO_REQUESTS;
      }
    },
  });
}

export function useAdminCYO() {
  return useQuery({
    queryKey: ["admin", "cyo"],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/custom-requests");
      } catch {
        return CYO_REQUESTS;
      }
    },
  });
}

export function useUpdateCYOStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/custom-requests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cyo"] });
    },
  });
}

function normalizeDriverProfile(d: any) {
  return {
    ...d,
    name: [d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || 'Driver',
    photo: d.user?.profileImageUrl || null,
    phone: d.user?.phone || '',
    experience: d.experienceYears ? `${d.experienceYears} years` : '',
    languages: d.languages || [],
    available: d.available ?? true,
    vehicles: (d.vehicles || []).map((v: any) => ({
      ...v,
      image: v.photoUrl || '',
      type: v.vehicleType || '',
      model: v.model || '',
      year: v.year || '',
      plate: v.plateNumber || '',
      features: v.features || [],
    })),
  };
}

export function useDriverProfile() {
  return useQuery({
    queryKey: ["driver", "profile"],
    queryFn: async () => {
      const d = await api.get<any>("/drivers/me");
      return normalizeDriverProfile(d);
    },
  });
}

export function useDriverBookings() {
  return useQuery({
    queryKey: ["driver", "bookings"],
    queryFn: () => api.get<any[]>("/drivers/trips/mine"),
  });
}

export function useDriverBooking(id: string) {
  return useQuery({
    queryKey: ["driver", "bookings", id],
    queryFn: () => api.get<any>(`/drivers/trips/${id}`),
    enabled: !!id,
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      api.put(`/drivers/trips/${id}`, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "bookings"] });
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<any>("/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/invoices");
      } catch (err: any) {
        if (err?.status === 401) return [];
        return [];
      }
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => api.get<any>(`/invoices/${id}`),
    enabled: !!id,
  });
}

export function useAdminDrivers() {
  return useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: () => api.get<any[]>("/drivers"),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<any>("/admin/stats").catch(() => null),
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => api.get<any[]>("/bookings").then(list => list.map(normalizeBooking)),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put<any>(`/bookings/${id}`, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.put<any>(`/bookings/${id}/cancel`, { reason }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
  });
}

export function useEarningsSummary() {
  return useQuery({
    queryKey: ["driver", "earnings"],
    queryFn: () => api.get<any>("/drivers/earnings/summary"),
  });
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put<any>("/drivers/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
  });
}

// ── Driver Notifications ─────────────────────────────────────────────────────

export function useDriverNotifications() {
  return useQuery({
    queryKey: ["driver", "notifications"],
    queryFn: () => api.get<any[]>("/drivers/notifications"),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<any>(`/drivers/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put<any>("/drivers/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "notifications"] });
    },
  });
}

// ── Driver Documents ─────────────────────────────────────────────────────────

export function useDriverDocuments() {
  return useQuery({
    queryKey: ["driver", "documents"],
    queryFn: () => api.get<any[]>("/drivers/documents"),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<any>("/drivers/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/drivers/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "documents"] });
    },
  });
}

// ── Driver Availability ──────────────────────────────────────────────────────

export function useDriverAvailability(month: string) {
  return useQuery({
    queryKey: ["driver", "availability", month],
    queryFn: () => api.get<any>(`/drivers/availability?month=${month}`),
    enabled: !!month,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { unavailableDates: string[] }) =>
      api.put<any>("/drivers/availability", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "availability"] });
    },
  });
}

// ── Driver Ratings ───────────────────────────────────────────────────────────

export function useDriverRatings() {
  return useQuery({
    queryKey: ["driver", "ratings"],
    queryFn: () => api.get<any>("/drivers/ratings"),
  });
}

// ── Trip Checklist ───────────────────────────────────────────────────────────

export function useDriverChecklist(tripId: string) {
  return useQuery({
    queryKey: ["driver", "checklist", tripId],
    queryFn: () => api.get<any>(`/drivers/trips/${tripId}/checklist`),
    enabled: !!tripId,
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, items }: { tripId: string; items: { id: string; checked: boolean }[] }) =>
      api.put<any>(`/drivers/trips/${tripId}/checklist`, { items }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["driver", "checklist", vars.tripId] });
    },
  });
}
