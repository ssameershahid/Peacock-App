import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Bookmark, MapPin, Calendar, Car, Users, ArrowRight, Trash2, Download, Send, Loader2 } from 'lucide-react';
import { useSavedTrips, useDeleteSavedTrip } from '@/hooks/use-app-data';
import { useToast } from '@/hooks/use-toast';
import { DESTINATIONS } from '@/pages/CYOWizard';
import { timeAgo } from '@/lib/date-utils';

function getDestNames(ids: string[]): string[] {
  return DESTINATIONS.filter(d => ids.includes(d.id)).map(d => d.name);
}

function getDestSummary(ids: string[]): string {
  const names = getDestNames(ids);
  if (names.length === 0) return 'No destinations';
  if (names.length <= 3) return names.join(', ');
  return `${names[0]}, ${names[1]}, ${names[2]} +${names.length - 3} more`;
}

export default function SavedTrips() {
  const { data: trips = [], isLoading } = useSavedTrips();
  const deleteSavedTrip = useDeleteSavedTrip();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteSavedTrip.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Saved trip deleted' });
        setConfirmDelete(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-forest-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-forest-600">
          Saved <em className="italic text-amber-200">trips</em>
        </h1>
        <p className="font-body text-sm text-warm-500 mt-1">Resume planning or submit for a quote</p>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-warm-100">
          <Bookmark className="w-12 h-12 text-warm-300 mx-auto mb-4" />
          <h2 className="font-display text-xl text-forest-600 mb-2">No saved trips yet</h2>
          <p className="font-body text-sm text-warm-500 mb-6 max-w-sm mx-auto">
            Use our trip builder to design your own journey — save it here to come back later
          </p>
          <Link href="/tours/custom">
            <Button className="font-body">
              Start building <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip: any) => {
            const data = trip.tripData || {};
            const destIds: string[] = data.destinations || [];
            const isComplete = trip.isComplete;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-xl border border-warm-100 p-5 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Mini map placeholder */}
                <div className="sm:w-40 h-28 sm:h-auto bg-sage rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-8 h-8 text-forest-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-body text-base font-medium text-forest-600 mb-1">
                    Custom trip to {getDestSummary(destIds)}
                  </h3>
                  <p className="font-body text-sm text-warm-500 mb-1">
                    {data.days || 7} days · {data.pax || 2} traveller{(data.pax || 2) !== 1 ? 's' : ''} · <span className="capitalize">{data.vehicle || 'minivan'}</span>
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-body text-xs text-warm-400">
                      Saved {timeAgo(trip.updatedAt || trip.createdAt)}
                    </span>
                    <span className={`font-body text-xs font-medium ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isComplete ? 'Complete — ready to submit' : `Step ${trip.currentStep} of 5 completed`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/tours/custom?resume=${trip.id}`)}
                      className="font-body text-xs h-8"
                    >
                      Resume planning <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                    {isComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/tours/custom?resume=${trip.id}`)}
                        className="font-body text-xs h-8"
                      >
                        <Send className="w-3 h-3 mr-1" /> Submit for quote
                      </Button>
                    )}
                    {confirmDelete === trip.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(trip.id)}
                          className="font-body text-xs h-8"
                        >
                          Confirm delete
                        </Button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="font-body text-xs text-warm-400 hover:text-warm-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(trip.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-body text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
