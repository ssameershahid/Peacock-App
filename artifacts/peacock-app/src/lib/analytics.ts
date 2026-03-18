declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const trackEvent = (
  name: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
};

// Predefined events for type safety and consistency
export const analytics = {
  tourViewed: (tourSlug: string, tourName: string) =>
    trackEvent("tour_viewed", { tour_slug: tourSlug, tour_name: tourName }),

  bookingStarted: (tourSlug: string, vehicleType: string) =>
    trackEvent("booking_started", { tour_slug: tourSlug, vehicle_type: vehicleType }),

  dateSelected: (startDate: string) =>
    trackEvent("date_selected", { start_date: startDate }),

  vehicleSelected: (vehicleType: string, priceGBP: number) =>
    trackEvent("vehicle_selected", { vehicle_type: vehicleType, price_gbp: priceGBP }),

  paymentInitiated: (referenceCode: string, totalGBP: number) =>
    trackEvent("payment_initiated", {
      reference_code: referenceCode,
      total_gbp: totalGBP,
      currency: "GBP",
    }),

  bookingCompleted: (referenceCode: string, totalGBP: number, bookingType: string) =>
    trackEvent("booking_completed", {
      reference_code: referenceCode,
      total_gbp: totalGBP,
      currency: "GBP",
      booking_type: bookingType,
    }),

  bookingFailed: (error: string) =>
    trackEvent("booking_failed", { error }),

  cyoRequestSubmitted: (locations: string[], durationDays?: number) =>
    trackEvent("cyo_request_submitted", {
      locations: locations.join(", "),
      duration_days: durationDays,
    }),

  transferBooked: (routeName: string, vehicleType: string) =>
    trackEvent("transfer_booked", {
      route_name: routeName,
      vehicle_type: vehicleType,
    }),
};
