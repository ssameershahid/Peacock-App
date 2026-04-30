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
  MOCK_TOUR_GROUPS,
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
    tourSlug: b.tourSlug ?? null,
    tourImage: b.tourImage ?? null,
    reviewed: b.reviewed ?? false,
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useTours() {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const tours = await api.get<any[]>("/tours");
      return normalizeTourList(tours ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Returns 6 tour groups each with their 4 duration variants
export function useTourGroups() {
  return useQuery({
    queryKey: ["tour-groups"],
    queryFn: async () => {
      const groups = await api.get<any[]>("/tours/groups");
      return groups ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Admin version — includes inactive groups so they can be re-activated
export function useAdminTourGroups() {
  return useQuery({
    queryKey: ["tour-groups", "admin"],
    queryFn: async () => {
      try {
        const groups = await api.get<any[]>("/tours/groups?includeInactive=true");
        return groups?.length > 0 ? groups : MOCK_TOUR_GROUPS;
      } catch {
        return MOCK_TOUR_GROUPS;
      }
    },
    staleTime: 30 * 1000,
  });
}

export function useToggleTourGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupSlug, isActive }: { groupSlug: string; isActive: boolean }) =>
      api.patch<any>(`/tours/groups/${groupSlug}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour-groups"] });
    },
  });
}

// Fetches a specific variant by groupSlug + duration days
export function useTourVariant(groupSlug: string, duration: number) {
  return useQuery({
    queryKey: ["tours", groupSlug, duration],
    queryFn: async () => {
      try {
        const tour = await api.get<any>(`/tours/${groupSlug}/${duration}`);
        return normalizeTour(tour);
      } catch {
        // Fallback: construct from mock group data when API is unavailable
        const group = MOCK_TOUR_GROUPS.find((g: any) => g.groupSlug === groupSlug);
        if (!group) return null;
        const variant = group.variants.find((v: any) => v.durationDays === duration)
          ?? group.variants[0];
        return normalizeTour({
          ...group,
          durationDays: variant?.durationDays ?? duration,
          vehicleRates: variant?.vehicleRates ?? [],
          itinerary: variant?.itinerary ?? Array.from({ length: variant?.durationDays ?? duration }, (_, i) => ({
            dayNumber: i + 1,
            title: `Day ${i + 1}`,
            location: '',
            description: '',
          })),
          whatsIncluded: [
            'Private vehicle & driver for the entire tour',
            'All fuel & tolls',
            'Driver accommodation & meals',
            'Airport pickup & drop-off',
            'Bottled water daily',
          ],
          whatsNotIncluded: [
            'Hotel accommodation',
            'Meals for travellers',
            'Entrance fees to attractions',
            'Tips for driver',
            'Travel insurance',
          ],
          addOns: [],
          minLeadTimeDays: 3,
        });
      }
    },
    enabled: !!groupSlug && !!duration,
    // Don't retry 404s — variant simply doesn't exist; the fallback handles it
    retry: (count: number, error: any) => error?.status !== 404 && count < 2,
  });
}

// Mutations for admin itinerary management
export function useUpdateTourItinerary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, days }: { tourId: string; days: any[] }) =>
      api.put<any>(`/tours/${tourId}/itinerary`, { days }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["tour-groups"] });
    },
  });
}

export function useUpdateTourMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, data }: { tourId: string; data: any }) =>
      api.put<any>(`/tours/${tourId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["tour-groups"] });
    },
  });
}

export function useUpdateTourVehicleRates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, rates }: { tourId: string; rates: any[] }) =>
      api.put<any>(`/tours/${tourId}/vehicle-rates`, { rates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["tour-groups"] });
    },
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: ["tours", slug],
    queryFn: async () => {
      const tour = await api.get<any>(`/tours/${slug}`);
      return normalizeTour(tour);
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

export function useCYOPricing() {
  return useQuery({
    queryKey: ["cyo-pricing"],
    queryFn: async () => {
      try {
        return await api.get<{ vehicleRates: Record<string, number>; upsells: any[] }>("/cyo-pricing");
      } catch {
        // Fallback to mock vehicle base rates if API unavailable
        const vehicleRates = MOCK_VEHICLES.reduce((acc: Record<string, number>, v: any) => {
          acc[v.id] = v.pricePerDay;
          return acc;
        }, {});
        return { vehicleRates, upsells: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
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

function normalizeCYORequest(r: any) {
  const statusMap: Record<string, string> = {
    NEW: 'New', REVIEWING: 'Reviewing', QUOTED: 'Quoted',
    AWAITING_PAYMENT: 'Awaiting Payment', PAID: 'Paid',
    CONFIRMED: 'Confirmed', ABANDONED: 'Abandoned',
  };
  return {
    ...r,
    status: statusMap[r.status] ?? r.status,
    customer: r.customerName || r.customer || 'Unknown',
    submittedAt: r.createdAt || r.submittedAt,
    dates: r.preferredDates || r.dates || '',
  };
}

export function useAdminCYO() {
  return useQuery({
    queryKey: ["admin", "cyo"],
    queryFn: async () => {
      try {
        const data = await api.get<any[]>("/custom-requests");
        return data.map(normalizeCYORequest);
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
    queryFn: () => api.get<any>("/admin/stats"),
    retry: false,
  });
}

export function useAdminToday() {
  return useQuery({
    queryKey: ["admin", "today"],
    queryFn: () => api.get<any>("/admin/today"),
    refetchInterval: 60_000,
  });
}

export function useAdminAttention() {
  return useQuery({
    queryKey: ["admin", "attention"],
    queryFn: () => api.get<any>("/admin/attention"),
    refetchInterval: 60_000,
  });
}

export function useAdminSearch(query: string) {
  return useQuery({
    queryKey: ["admin", "search", query],
    queryFn: () => api.get<any>(`/admin/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => api.get<any[]>("/admin/customers"),
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: () => api.get<any>(`/admin/customers/${id}`),
    enabled: !!id,
  });
}

export function useAdminDriverDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "drivers", id, "detail"],
    queryFn: () => api.get<any>(`/admin/drivers/${id}/detail`),
    enabled: !!id,
  });
}

export function useBookingActivities(bookingId: string) {
  return useQuery({
    queryKey: ["bookings", bookingId, "activities"],
    queryFn: () => api.get<any[]>(`/bookings/${bookingId}/activities`),
    enabled: !!bookingId,
  });
}

export function useAdminSeasons() {
  return useQuery({
    queryKey: ["admin", "pricing", "seasons"],
    queryFn: () => api.get<any[]>("/admin/pricing/seasons"),
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<any>("/admin/pricing/seasons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing", "seasons"] });
    },
  });
}

export function useUpdateSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put<any>(`/admin/pricing/seasons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing", "seasons"] });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/admin/pricing/seasons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing", "seasons"] });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, docId, action, reason }: { driverId: string; docId: string; action: string; reason?: string }) =>
      api.put<any>(`/admin/drivers/${driverId}/documents/${docId}/verify`, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
    },
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

// ── Tourist Dashboard ───────────────────────────────────────────────────────

export function useTouristDashboard() {
  return useQuery({
    queryKey: ["account", "dashboard"],
    queryFn: async () => {
      try {
        return await api.get<any>("/account/dashboard");
      } catch {
        return { upcomingTrips: [], activeTrips: [], completedTripsNeedingReview: [], totalTrips: 0, totalSpent: 0 };
      }
    },
    refetchInterval: 120_000,
  });
}

// ── Tourist Notifications ───────────────────────────────────────────────────

export function useTouristNotifications() {
  return useQuery({
    queryKey: ["account", "notifications"],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/account/notifications");
      } catch {
        return [];
      }
    },
    refetchInterval: 60_000,
  });
}

export function useMarkTouristNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<any>(`/account/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "notifications"] });
    },
  });
}

export function useMarkAllTouristNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put<any>("/account/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "notifications"] });
    },
  });
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export function useReview(bookingId: string) {
  return useQuery({
    queryKey: ["reviews", bookingId],
    queryFn: async () => {
      try {
        return await api.get<any>(`/account/reviews/${bookingId}`);
      } catch {
        return null;
      }
    },
    enabled: !!bookingId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; rating: number; reviewText?: string; wouldRecommend?: boolean }) =>
      api.post<any>("/account/reviews", data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", vars.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["account", "dashboard"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; rating?: number; reviewText?: string; wouldRecommend?: boolean }) =>
      api.put<any>(`/account/reviews/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

// ── Communication Preferences ───────────────────────────────────────────────

export function useCommunicationPreferences() {
  return useQuery({
    queryKey: ["account", "preferences"],
    queryFn: async () => {
      try {
        return await api.get<any>("/account/preferences");
      } catch {
        return { preTripReminders: true, reviewRequests: true, marketing: false };
      }
    },
  });
}

export function useUpdateCommunicationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { preTripReminders?: boolean; reviewRequests?: boolean; marketing?: boolean }) =>
      api.put<any>("/account/preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "preferences"] });
    },
  });
}

// ── Trip Sharing ────────────────────────────────────────────────────────────

export function useCreateShareLink() {
  return useMutation({
    mutationFn: (bookingId: string) => api.post<any>(`/account/bookings/${bookingId}/share`, {}),
  });
}

// ── Update Booking Trip Details ─────────────────────────────────────────────

export function useUpdateBookingDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put<any>(`/account/bookings/${id}/details`, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["account", "dashboard"] });
    },
  });
}

// ── Saved Trips ────────────────────────────────────────────────────────────

export function useSavedTrips() {
  return useQuery({
    queryKey: ["saved-trips"],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/saved-trips");
      } catch (err: any) {
        if (err?.status === 401) return [];
        return [];
      }
    },
  });
}

export function useSavedTrip(id: string) {
  return useQuery({
    queryKey: ["saved-trips", id],
    queryFn: () => api.get<any>(`/saved-trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateSavedTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tripData: any; currentStep: number; isComplete?: boolean }) =>
      api.post<any>("/saved-trips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-trips"] });
    },
  });
}

export function useUpdateSavedTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put<any>(`/saved-trips/${id}`, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["saved-trips"] });
      queryClient.invalidateQueries({ queryKey: ["saved-trips", vars.id] });
    },
  });
}

export function useDeleteSavedTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/saved-trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-trips"] });
    },
  });
}

// ── Trip Leads ─────────────────────────────────────────────────────────────

export function useEmailTripPlan() {
  return useMutation({
    mutationFn: (data: { email: string; name?: string; tripData: any; currentStep?: number; source?: string; utmParams?: any }) =>
      api.post<{ id: string; emailSent: boolean }>("/trip-leads", data),
  });
}

export function useLeadTripData(id: string) {
  return useQuery({
    queryKey: ["trip-leads", id, "trip-data"],
    queryFn: () => api.get<any>(`/trip-leads/${id}/trip-data`),
    enabled: !!id,
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => api.get<any[]>("/trip-leads/admin/all"),
  });
}

export function useAdminLead(id: string) {
  return useQuery({
    queryKey: ["admin", "leads", id],
    queryFn: () => api.get<any>(`/trip-leads/admin/${id}`),
    enabled: !!id,
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put<any>(`/trip-leads/admin/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
  });
}
