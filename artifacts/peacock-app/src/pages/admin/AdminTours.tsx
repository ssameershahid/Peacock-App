import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { useTours } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import AdminLayout from './AdminLayout';

export default function AdminTours() {
  const { data: tours } = useTours();
  const { format } = useCurrency();

  const tableData = (tours || []).map(t => ({
    ...t,
    name: t.title,
    type: 'Ready-made',
    duration: `${t.durationDays}D / ${t.durationNights}N`,
    regionList: t.regions.join(', '),
    price: format(t.basePrice),
    statusLabel: 'Active',
  }));

  return (
    <AdminLayout
      title="Tours"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tours' }]}
      actions={
        <Link href="/admin/tours/new">
          <button className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200">
            <Plus className="w-4 h-4" /> Create new tour
          </button>
        </Link>
      }
    >
      <DataTable
        columns={[
          { key: 'name', label: 'Name', sortable: true, render: (row: any) => (
            <span className="font-medium text-forest-600">{row.name}</span>
          )},
          { key: 'type', label: 'Type', render: () => (
            <span className="bg-forest-50 text-forest-600 font-body text-[10px] font-medium px-2 py-0.5 rounded-pill">Ready-made</span>
          )},
          { key: 'duration', label: 'Duration', sortable: true },
          { key: 'regionList', label: 'Regions', render: (row: any) => (
            <div className="flex flex-wrap gap-1">
              {row.regions.slice(0, 3).map((r: string) => (
                <span key={r} className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{r}</span>
              ))}
              {row.regions.length > 3 && <span className="font-body text-[10px] text-warm-400">+{row.regions.length - 3}</span>}
            </div>
          )},
          { key: 'price', label: 'Base price', sortable: true },
          { key: 'statusLabel', label: 'Status', render: () => (
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
              <span className="font-body text-xs text-emerald-600">Active</span>
            </div>
          )},
          { key: 'actions', label: '', render: (row: any) => (
            <Link href={`/admin/tours/${row.slug}/edit`}>
              <button className="font-body text-xs text-forest-500 hover:text-amber-200 font-medium transition-colors">Edit</button>
            </Link>
          )},
        ]}
        data={tableData}
        filters={[
          { key: 'type', label: 'All types', options: [{ value: 'Ready-made', label: 'Ready-made' }] },
        ]}
        searchPlaceholder="Search tours..."
      />
    </AdminLayout>
  );
}
