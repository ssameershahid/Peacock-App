import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

const FOREST = '#1b3c34';
const AMBER = '#f59e0b';
const WARM_GRAY = '#78716c';
const LIGHT_GRAY = '#f5f5f4';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#292524',
    padding: 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: FOREST,
  },
  logo: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: FOREST,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 9,
    color: WARM_GRAY,
    marginTop: 2,
    letterSpacing: 1,
  },
  invoiceLabel: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: FOREST,
    textAlign: 'right',
  },
  invoiceNum: {
    fontSize: 10,
    color: WARM_GRAY,
    textAlign: 'right',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  metaBlock: {
    width: '48%',
  },
  metaTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WARM_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 10,
    color: FOREST,
    lineHeight: 1.5,
  },
  statusBadge: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: FOREST,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  colText: {
    fontSize: 10,
    color: '#292524',
  },
  totals: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  totalLabel: {
    fontSize: 10,
    color: WARM_GRAY,
  },
  totalValue: {
    fontSize: 10,
    color: FOREST,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: FOREST,
    borderRadius: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValue: {
    fontSize: 11,
    color: AMBER,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: WARM_GRAY,
    lineHeight: 1.5,
  },
  thankYou: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: FOREST,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  status: 'PAID' | 'UNPAID' | 'REFUNDED';
  customer: {
    name: string;
    email: string;
    country?: string;
  };
  booking: {
    referenceCode: string;
    title: string;
    startDate: string;
    endDate?: string;
    vehicleType: string;
    numDays?: number;
  };
  lineItems: Array<{ description: string; amount: number }>;
  subtotal: number;
  taxAmount?: number;
  totalGBP: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(n);
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document
      title={`Invoice ${data.invoiceNumber} — Peacock Drivers`}
      author="Peacock Drivers"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Peacock Drivers</Text>
            <Text style={styles.logoSub}>SRI LANKA PRIVATE TOURS</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNum}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Billed to</Text>
            <Text style={styles.metaText}>{data.customer.name}</Text>
            <Text style={styles.metaText}>{data.customer.email}</Text>
            {data.customer.country && (
              <Text style={styles.metaText}>{data.customer.country}</Text>
            )}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Invoice details</Text>
            <Text style={styles.metaText}>Date: {data.issueDate}</Text>
            <Text style={styles.metaText}>Booking ref: {data.booking.referenceCode}</Text>
            <Text style={styles.metaText}>
              Status:{' '}
              <Text style={{ color: data.status === 'PAID' ? '#059669' : '#dc2626' }}>
                {data.status}
              </Text>
            </Text>
          </View>
        </View>

        {/* Trip summary */}
        <View style={{ backgroundColor: LIGHT_GRAY, borderRadius: 4, padding: 12, marginBottom: 20 }}>
          <Text style={[styles.metaTitle, { marginBottom: 4 }]}>Trip summary</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: FOREST, marginBottom: 3 }}>
            {data.booking.title}
          </Text>
          <Text style={{ fontSize: 9, color: WARM_GRAY }}>
            {data.booking.startDate}
            {data.booking.endDate ? ` → ${data.booking.endDate}` : ''}
            {data.booking.numDays ? ` · ${data.booking.numDays} days` : ''}
            {' · '}{data.booking.vehicleType}
          </Text>
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Amount</Text>
          </View>
          {data.lineItems.map((item, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.colText, styles.col1]}>{item.description}</Text>
              <Text style={[styles.colText, styles.col2]}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          {data.taxAmount != null && data.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(data.subtotal)}</Text>
            </View>
          )}
          {data.taxAmount != null && data.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{fmt(data.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total (GBP)</Text>
            <Text style={styles.grandTotalValue}>{fmt(data.totalGBP)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerText}>
              Peacock Drivers (Pvt) Ltd{'\n'}
              123 Galle Road, Colombo 03, Sri Lanka{'\n'}
              info@peacockdrivers.com · +94 77 123 4567
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.footerText}>
              All prices in GBP.{'\n'}
              Thank you for choosing Peacock Drivers.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadInvoicePDF(data: InvoiceData): Promise<void> {
  const blob = await pdf(<InvoiceDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${data.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export { InvoiceDocument };
