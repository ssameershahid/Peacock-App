import { Link } from 'wouter';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useUserBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import AdminLayout from './AdminLayout';

export default function AdminBookings() {
  const { data: bookings } = useUserBookings();
  const { format } = useCurrency();

  const tableData = (bookings || []).map(b => ({
    ...b,
    customerName: b.customer.name,
    driverName: b.driver?.name || 'Unassigned',
    typeLabel: b.type === 'tour' ? 'Tour' : 'Transfer',
    dateLabel: new Date(b.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    amount: b.price,
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AdminLayout
      title="Bookings"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings' }]}
      actions={
        <button className="flex items-center gap-2 bg-white border border-warm-200 text-forest-600 font-body text-sm font-medium px-5 py-2.5 rounded-full hover:bg-warm-50 transition-all duration-200">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      }
    >
      <DataTable
        columns={[
          { key: 'id', label: 'Reference', sortable: true, render: (row: any) => (
            <Link href={`/admin/bookings/${row.id}`}>
              <span className="font-medium text-forest-600 hover:text-amber-200 cursor-pointer">{row.id}</span>
            </Link>
          )},
          { key: 'customerName', label: 'Customer', sortable: true },
          { key: 'typeLabel', label: 'Type', render: (row: any) => (
            <span className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-pill ${row.type === 'tour' ? 'bg-forest-50 text-forest-600' : 'bg-blue-50 text-blue-600'}`}>
              {row.typeLabel}
            </span>
          )},
          { key: 'title', label: 'Tour/Route', sortable: true },
          { key: 'dateLabel', label: 'Dates', sortable: true },
          { key: 'vehicle', label: 'Vehicle' },
          { key: 'driverName', label: 'Driver', render: (row: any) => (
            <span className={row.driverName === 'Unassigned' ? 'text-amber-200 font-medium' : ''}>{row.driverName}</span>
          )},
          { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
          { key: 'amount', label: 'Amount', sortable: true, render: (row: any) => (
            <span className="font-medium text-forest-600">{format(row.amount)}</span>
          )},
        ]}
        data={tableData}
        filters={[
          { key: 'typeLabel', label: 'All types', options: [{ value: 'Tour', label: 'Tour' }, { value: 'Transfer', label: 'Transfer' }] },
          { key: 'status', label: 'All statuses', options: [
            { value: 'Upcoming', label: 'Confirmed' }, { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]},
        ]}
        searchPlaceholder="Search by reference or customer..."
      />
    </AdminLayout>
  );
}
