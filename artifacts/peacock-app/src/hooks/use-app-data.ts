import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TOURS, VEHICLES, TRANSFERS, BOOKINGS, CYO_REQUESTS } from "@/lib/mock-data";

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useTours() {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      await delay(500);
      return TOURS;
    }
  });
}

export function useTour(slug: string) {
  return useQuery({
    queryKey: ["tours", slug],
    queryFn: async () => {
      await delay(300);
      const tour = TOURS.find(t => t.slug === slug);
      if (!tour) throw new Error("Tour not found");
      return tour;
    }
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      await delay(200);
      return VEHICLES;
    }
  });
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      await delay(300);
      return TRANSFERS;
    }
  });
}

export function useUserBookings() {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: async () => {
      await delay(600);
      return BOOKINGS;
    }
  });
}

export function useAdminCYO() {
  return useQuery({
    queryKey: ["admin", "cyo"],
    queryFn: async () => {
      await delay(400);
      return CYO_REQUESTS;
    }
  });
}

export function useUpdateCYOStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await delay(500);
      // In a real app, this updates the DB. Here we just pretend it succeeded.
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cyo"] });
    }
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      await delay(1000);
      return { success: true, id: `BK-${Math.floor(Math.random() * 10000)}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    }
  });
}
