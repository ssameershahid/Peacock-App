import { useParams, Link } from 'wouter';
import { Mail, Phone, Star, Car, FileText, Clock, ChevronRight } from 'lucide-react';
import { useAdminDriverDetail, useVerifyDocument } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import AdminLayout from './AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/date-utils';

/* ── Star rating bar ───────────────────────────────────────────────────────── */

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-xs text-warm-500 w-12">{stars} star</span>
      <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-body text-xs text-warm-400 w-8 text-right">{count}</span>
    </div>
  );
}

export default function AdminDriverDetail() {
  const params = useParams<{ id: string }>();
  const driverId = params?.id || '';
  const { data: driver } = useAdminDriverDetail(driverId);
  const verifyDocument = useVerifyDocument();
  const { format } = useCurrency();
  const { toast } = useToast();

  /* ── Loading state ─────────────────────────────────────────────────────── */

  if (!driver) {
    return (
      <AdminLayout
        title="Driver"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Drivers', href: '/admin/drivers' },
          { label: driverId },
        ]}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  /* ── Derived data ──────────────────────────────────────────────────────── */

  const user = driver.user || {};
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Driver';
  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';
  const performance = driver.performance || {};
  const ratingDist = performance.ratingDistribution || {};
  const totalRatings = Object.values(ratingDist as Record<string, number>).reduce(
    (sum: number, v: unknown) => sum + (v as number),
    0
  );
  const ratings = driver.ratings || [];
  const vehicles = driver.vehicles || [];
  const documents = driver.documents || [];
  const currentTrips = driver.currentTrips || [];
  const tripHistory = driver.tripHistory || [];

  /* ── Document verification handler ────────────────────────────────────── */

  const handleVerify = async (docId: string, action: 'verify' | 'reject') => {
    try {
      await verifyDocument.mutateAsync({ driverId, docId, action });
      toast({ title: action === 'verify' ? 'Document verified' : 'Document rejected' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <AdminLayout
      title={fullName}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Drivers', href: '/admin/drivers' },
        { label: fullName },
      ]}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 mb-6">
        <StatusBadge status={driver.isActive ? 'Active' : 'Inactive'} />
        {driver.createdAt && (
          <span className="font-body text-sm text-warm-400">
            Driver since {formatDate(driver.createdAt)}
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Performance summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-body text-xs text-warm-400">Average rating</span>
              </div>
              <p className="font-display text-2xl text-forest-600">
                {performance.avgRating != null ? performance.avgRating.toFixed(1) : '--'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-warm-400" />
                <span className="font-body text-xs text-warm-400">Trips completed</span>
              </div>
              <p className="font-display text-2xl text-forest-600">
                {performance.totalTrips ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-body text-xs text-warm-400">Total earnings</span>
              </div>
              <p className="font-display text-2xl text-forest-600">
                {format(performance.totalEarnings ?? 0)}
              </p>
            </div>
          </div>

          {/* Section 2: Ratings */}
          {(performance.totalTrips ?? 0) > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Ratings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Star distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => (
                    <RatingBar
                      key={stars}
                      stars={stars}
                      count={(ratingDist as any)[stars] ?? 0}
                      total={totalRatings}
                    />
                  ))}
                </div>
                {/* Recent reviews */}
                <div className="space-y-3">
                  <p className="font-body text-xs font-medium text-warm-500">Recent reviews</p>
                  {ratings.length === 0 && (
                    <p className="font-body text-sm text-warm-400">No reviews yet</p>
                  )}
                  {ratings.slice(0, 3).map((review: any, idx: number) => (
                    <div key={idx} className="border-b border-warm-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-warm-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-body text-xs text-warm-400">
                          {review.touristName}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="font-body text-sm text-warm-600">{review.comment}</p>
                      )}
                      <p className="font-body text-[10px] text-warm-400 mt-1">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Vehicles */}
          {vehicles.length > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Vehicles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((v: any, idx: number) => (
                  <div
                    key={v.id || idx}
                    className="border border-warm-100 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-forest-500" />
                      <div>
                        <p className="font-body text-sm font-semibold text-forest-600">
                          {v.model || v.vehicleType || 'Vehicle'}
                        </p>
                        <p className="font-body text-xs text-warm-400 capitalize">
                          {v.vehicleType || v.type}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-body">
                      <div>
                        <span className="text-warm-400">Plate:</span>{' '}
                        <span className="text-forest-600">{v.plateNumber || v.plate || '--'}</span>
                      </div>
                      <div>
                        <span className="text-warm-400">Year:</span>{' '}
                        <span className="text-forest-600">{v.year || '--'}</span>
                      </div>
                    </div>
                    {v.features && v.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {v.features.map((f: string) => (
                          <span
                            key={f}
                            className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Documents */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Documents</h2>
            {documents.length === 0 ? (
              <p className="font-body text-sm text-warm-400">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: any, idx: number) => {
                  const statusColor =
                    doc.status === 'verified' || doc.status === 'Verified'
                      ? 'bg-[#E8F5E9] text-[#2D7A4F]'
                      : doc.status === 'expired' || doc.status === 'Expired'
                        ? 'bg-[#FDECEA] text-[#C4382A]'
                        : 'bg-[#FDF5E0] text-[#8A6200]';
                  return (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between border border-warm-100 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-warm-400" />
                        <div>
                          <p className="font-body text-sm text-forest-600 font-medium">
                            {doc.name || doc.type || 'Document'}
                          </p>
                          {doc.expiryDate && (
                            <p className="font-body text-[10px] text-warm-400">
                              Expires {formatDate(doc.expiryDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-body font-medium ${statusColor}`}
                        >
                          {doc.status || 'Pending'}
                        </span>
                        {doc.status !== 'verified' && doc.status !== 'Verified' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerify(doc.id, 'verify')}
                              disabled={verifyDocument.isPending}
                              className="bg-forest-600 hover:bg-forest-500 text-white font-body text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-60"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerify(doc.id, 'reject')}
                              disabled={verifyDocument.isPending}
                              className="border border-red-300 text-red-600 hover:bg-red-50 font-body text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Current & upcoming trips */}
          {currentTrips.length > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">
                Current & upcoming trips
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-100">
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Ref
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Tour
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Dates
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Customer
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTrips.slice(0, 5).map((trip: any, idx: number) => (
                      <tr key={trip.referenceCode || idx} className="border-b border-warm-50 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/bookings/${trip.id || trip.referenceCode}`}
                            className="font-body text-sm text-forest-500 hover:text-amber-200 font-medium"
                          >
                            {trip.referenceCode}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-forest-600">
                          {trip.tourName}
                        </td>
                        <td className="py-3 pr-4 font-body text-xs text-warm-500">
                          {formatDate(trip.startDate, 'short')} - {formatDate(trip.endDate, 'short')}
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-warm-600">
                          {trip.customerName}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={trip.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 6: Trip history */}
          {tripHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Trip history</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-100">
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Ref
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Tour
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Dates
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Customer
                      </th>
                      <th className="text-right font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3">
                        Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripHistory.slice(0, 10).map((trip: any, idx: number) => (
                      <tr key={trip.referenceCode || idx} className="border-b border-warm-50 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/bookings/${trip.id || trip.referenceCode}`}
                            className="font-body text-sm text-forest-500 hover:text-amber-200 font-medium"
                          >
                            {trip.referenceCode}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-forest-600">
                          {trip.tourName}
                        </td>
                        <td className="py-3 pr-4 font-body text-xs text-warm-500">
                          {formatDate(trip.startDate, 'short')} - {formatDate(trip.endDate, 'short')}
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-warm-600">
                          {trip.customerName}
                        </td>
                        <td className="py-3 text-right font-body text-sm font-semibold text-forest-600">
                          {format(trip.earnings ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Quick info card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <div className="flex flex-col items-center text-center mb-5">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xl font-bold mb-3">
                  {initials}
                </div>
              )}
              <h3 className="font-display text-lg text-forest-600">{fullName}</h3>
            </div>

            <div className="space-y-3">
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-2.5 font-body text-sm text-forest-500 hover:text-amber-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-warm-400" />
                  {user.phone}
                </a>
              )}
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-2.5 font-body text-sm text-forest-500 hover:text-amber-200 transition-colors"
                >
                  <Mail className="w-4 h-4 text-warm-400" />
                  {user.email}
                </a>
              )}
            </div>

            {/* Languages */}
            {driver.languages && driver.languages.length > 0 && (
              <div className="mt-4">
                <p className="font-body text-xs text-warm-400 mb-1.5">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {driver.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {driver.experienceYears != null && (
              <div className="mt-4">
                <p className="font-body text-xs text-warm-400 mb-0.5">Experience</p>
                <p className="font-body text-sm text-forest-600 font-medium">
                  {driver.experienceYears} year{driver.experienceYears !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Availability badge */}
            <div className="mt-4">
              <p className="font-body text-xs text-warm-400 mb-1.5">Availability</p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-body font-medium ${
                  driver.isActive
                    ? 'bg-[#E8F5E9] text-[#2D7A4F]'
                    : 'bg-[#FDF5E0] text-[#8A6200]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    driver.isActive ? 'bg-[#2D7A4F]' : 'bg-[#8A6200]'
                  }`}
                />
                {driver.isActive ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {/* Edit profile button */}
            <div className="mt-5">
              <Link href={`/admin/drivers/${driverId}/edit`}>
                <button className="w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2">
                  Edit profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
