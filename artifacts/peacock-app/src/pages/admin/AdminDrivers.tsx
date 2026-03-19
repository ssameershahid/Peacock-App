import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import AdminLayout from './AdminLayout';
import { useAdminDrivers } from '@/hooks/use-app-data';

export default function AdminDrivers() {
  const { data: rawDrivers, isLoading } = useAdminDrivers();

  const drivers = (rawDrivers || []).map((d: any) => ({
    id: d.id,
    name: [d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || d.id,
    initials: [d.user?.firstName?.[0], d.user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?',
    phone: d.user?.phone || '—',
    languages: d.languages || [],
    vehicleCount: (d.vehicles || []).length,
    trips: d.completedTrips ?? 0,
    status: d.available ? 'Active' : 'Inactive',
  }));

  return (
    <AdminLayout
      title="Drivers"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Drivers' }]}
      actions={
        <Link href="/admin/drivers/new">
          <button className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Add new driver
          </button>
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white border border-warm-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'initials', label: '', render: (row: any) => (
              <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xs font-bold">{row.initials}</div>
            )},
            { key: 'name', label: 'Name', sortable: true, render: (row: any) => (
              <span className="font-medium text-forest-600">{row.name}</span>
            )},
            { key: 'phone', label: 'Phone' },
            { key: 'languages', label: 'Languages', render: (row: any) => (
              <div className="flex flex-wrap gap-1">
                {row.languages.map((l: string) => (
                  <span key={l} className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{l}</span>
                ))}
              </div>
            )},
            { key: 'vehicleCount', label: 'Vehicles', sortable: true },
            { key: 'trips', label: 'Trips', sortable: true },
            { key: 'status', label: 'Status', render: (row: any) => (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-5 rounded-full relative ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-warm-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm ${row.status === 'Active' ? 'right-0.5' : 'left-0.5'}`} />
                </div>
                <span className={`font-body text-xs ${row.status === 'Active' ? 'text-emerald-600' : 'text-warm-400'}`}>{row.status}</span>
              </div>
            )},
            { key: 'actions', label: '', render: (row: any) => (
              <Link href={`/admin/drivers/${row.id}/edit`}>
                <button className="font-body text-xs text-forest-500 hover:text-amber-500 font-medium transition-colors">Edit</button>
              </Link>
            )},
          ]}
          data={drivers}
          filters={[
            { key: 'status', label: 'All statuses', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
          ]}
          searchPlaceholder="Search drivers..."
        />
      )}
    </AdminLayout>
  );
}
