import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Trash2,
  Edit,
  Music,
  Gamepad2,
  Mic2,
  Trophy,
  PartyPopper,
  Star,
  HelpCircle,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useEvents, useDeleteEvent, Event } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

// Event type icon mapping
const EVENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  live_music: Music,
  dj: Music,
  comedy: Mic2,
  trivia: Gamepad2,
  sports: Trophy,
  themed: PartyPopper,
  special: Star,
  other: HelpCircle,
};

// Format event type for display
const formatEventType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format date for display
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format time for display
const formatEventTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function EventsPage() {
  const { isDemoMode } = useAuth();
  const { events, isLoading, error, refetch } = useEvents();
  const { deleteEvent } = useDeleteEvent();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setDeletingId(eventId);
      const success = await deleteEvent(eventId);
      if (success) {
        refetch();
      }
      setDeletingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 mb-4">Error loading events: {error}</p>
        <button onClick={refetch} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your venue's events and activities</p>
          {isDemoMode && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Demo Mode - Showing sample events
            </div>
          )}
        </div>
        <Link to="/events/new" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </Link>
      </div>

      {/* Empty State */}
      {events.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first event to start attracting customers
          </p>
          <Link to="/events/new" className="btn btn-primary inline-flex">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Event
          </Link>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const IconComponent = EVENT_TYPE_ICONS[event.type] || HelpCircle;
            const isUpcoming = new Date(event.start_time) > new Date();

            return (
              <div
                key={event.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* Event Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded">
                    <IconComponent className="w-3.5 h-3.5 mr-1" />
                    {formatEventType(event.type)}
                  </span>
                  {!isUpcoming && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                      Past Event
                    </span>
                  )}
                </div>

                {/* Event Title & Description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatEventDate(event.start_time)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {formatEventTime(event.start_time)}
                    {event.end_time && ` - ${formatEventTime(event.end_time)}`}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {event.rsvp_count} RSVPs
                    {event.capacity && ` / ${event.capacity} capacity`}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    {event.is_free ? 'Free Entry' : `$${event.cover_charge} cover`}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={deletingId === event.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Event"
                  >
                    {deletingId === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
