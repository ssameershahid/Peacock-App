import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Calendar, ExternalLink, ArrowRight, Eye, Loader2, CheckCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAdminLeads, useConvertLead } from '@/hooks/use-app-data';
import { useToast } from '@/hooks/use-toast';
import { timeAgo } from '@/lib/date-utils';

const DESTINATIONS_MAP: Record<string, string> = {
  colombo: 'Colombo', sigiriya: 'Sigiriya', kandy: 'Kandy', ella: 'Ella',
  galle: 'Galle', yala: 'Yala', trincomalee: 'Trincomalee', negombo: 'Negombo',
  'nuwara-eliya': 'Nuwara Eliya', tangalle: 'Tangalle', anuradhapura: 'Anuradhapura', haputale: 'Haputale',
};

function getDestNames(ids: string[]): string {
  const names = (ids || []).map(id => DESTINATIONS_MAP[id] || id);
  if (names.length <= 3) return names.join(', ');
  return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
}

function getLeadStatus(lead: any): { label: string; color: string } {
  if (lead.convertedAt) return { label: 'Converted', color: 'text-emerald-600 bg-emerald-100' };
  if (lead.followUp2SentAt) return { label: 'Followed up', color: 'text-blue-600 bg-blue-100' };
  if (lead.followUp1SentAt) return { label: 'Followed up', color: 'text-blue-600 bg-blue-100' };
  return { label: 'New', color: 'text-amber-600 bg-amber-100' };
}

export default function AdminLeads() {
  const { data: leads = [], isLoading } = useAdminLeads();
  const convertLead = useConvertLead();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleConvert = (lead: any) => {
    convertLead.mutate(
      { id: lead.id, data: { convertedAt: new Date().toISOString() } },
      {
        onSuccess: () => {
          toast({ title: 'Lead marked as converted' });
        },
      }
    );
  };

  return (
    <AdminLayout
      title="Leads"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Leads' }]}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-forest-500" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-warm-100">
          <Mail className="w-12 h-12 text-warm-300 mx-auto mb-4" />
          <h2 className="font-display text-xl text-forest-600 mb-2">No leads yet</h2>
          <p className="font-body text-sm text-warm-500">Email captures from the CYO wizard will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 border-b border-warm-100">
                  <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider hidden sm:table-cell">Name</th>
                  <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider hidden md:table-cell">Destinations</th>
                  <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">Captured</th>
                  <th className="text-left px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {leads.map((lead: any) => {
                  const status = getLeadStatus(lead);
                  const tripData = lead.tripData || {};
                  const isExpanded = expandedId === lead.id;

                  return (
                    <React.Fragment key={lead.id}>
                      <tr className="hover:bg-warm-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-body text-sm text-forest-600">{lead.email}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="font-body text-sm text-warm-600">{lead.name || '—'}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-body text-xs text-warm-500">
                            {getDestNames(tripData.destinations || [])}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-body text-xs text-warm-400">{timeAgo(lead.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-body font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                              className="p-1.5 rounded-lg text-warm-400 hover:text-forest-600 hover:bg-warm-50 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!lead.convertedAt && (
                              <button
                                onClick={() => handleConvert(lead)}
                                className="p-1.5 rounded-lg text-warm-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Mark converted"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-warm-50/50">
                            <div className="grid sm:grid-cols-2 gap-4 font-body text-sm">
                              <div>
                                <span className="text-warm-400 text-xs uppercase tracking-wider block mb-1">Trip details</span>
                                <div className="space-y-1">
                                  <p className="text-warm-600"><strong>Type:</strong> <span className="capitalize">{tripData.tripType || '—'}</span></p>
                                  <p className="text-warm-600"><strong>Duration:</strong> {tripData.days || 7} days</p>
                                  <p className="text-warm-600"><strong>Travellers:</strong> {tripData.pax || 2}</p>
                                  <p className="text-warm-600"><strong>Vehicle:</strong> <span className="capitalize">{tripData.vehicle || '—'}</span></p>
                                  <p className="text-warm-600"><strong>Budget:</strong> <span className="capitalize">{tripData.budget || '—'}</span></p>
                                </div>
                              </div>
                              <div>
                                <span className="text-warm-400 text-xs uppercase tracking-wider block mb-1">Destinations</span>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {(tripData.destinations || []).map((id: string) => (
                                    <span key={id} className="px-2 py-0.5 bg-sage rounded-full text-xs text-forest-600 font-medium">
                                      {DESTINATIONS_MAP[id] || id}
                                    </span>
                                  ))}
                                </div>
                                {(tripData.interests || []).length > 0 && (
                                  <>
                                    <span className="text-warm-400 text-xs uppercase tracking-wider block mb-1">Interests</span>
                                    <div className="flex flex-wrap gap-1">
                                      {tripData.interests.map((i: string) => (
                                        <span key={i} className="px-2 py-0.5 bg-forest-100 rounded-full text-xs text-forest-600">
                                          {i}
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-warm-400 text-xs uppercase tracking-wider block mb-1">Lead metadata</span>
                                <div className="flex flex-wrap gap-4 text-xs text-warm-500">
                                  <span>Source: {lead.source || 'cyo_wizard'}</span>
                                  <span>Step: {lead.currentStep || '—'}</span>
                                  {lead.utmSource && <span>UTM: {lead.utmSource}/{lead.utmMedium}/{lead.utmCampaign}</span>}
                                  {lead.emailSentAt && <span>Email sent: {timeAgo(lead.emailSentAt)}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
