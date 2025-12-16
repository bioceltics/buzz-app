import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface EventForm {
  title: string;
  description: string;
  type: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isFree: boolean;
  coverCharge: number;
  ageRestriction: number;
  dressCode: string;
  capacity: number;
}

const EVENT_TYPES = [
  { value: 'live_music', label: 'Live Music' },
  { value: 'dj', label: 'DJ Night' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'sports', label: 'Sports' },
  { value: 'themed', label: 'Themed Party' },
  { value: 'special', label: 'Special Event' },
  { value: 'other', label: 'Other' },
];

export function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { venue } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventForm>({
    defaultValues: {
      isFree: true,
    },
  });

  const isFree = watch('isFree');

  const onSubmit = async (data: EventForm) => {
    if (!venue?.id) {
      toast.error('No venue found. Please complete onboarding first.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      // Combine date and time into ISO strings
      const startTime = new Date(`${data.startDate}T${data.startTime}`).toISOString();
      const endTime = data.endDate && data.endTime
        ? new Date(`${data.endDate}T${data.endTime}`).toISOString()
        : undefined;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          venue_id: venue.id,
          title: data.title,
          description: data.description,
          type: data.type || 'other',
          start_time: startTime,
          end_time: endTime,
          is_free: data.isFree,
          cover_charge: !data.isFree ? data.coverCharge : undefined,
          age_restriction: data.ageRestriction || undefined,
          dress_code: data.dressCode || undefined,
          capacity: data.capacity || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      console.error('Create event error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Events
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600">Set up a new event for your venue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Event Title</label>
              <input
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Live Jazz Friday"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[120px]"
                placeholder="Describe your event..."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="label">Event Type</label>
              <select className="input" {...register('type', { required: true })}>
                <option value="">Select type...</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                {...register('startDate', { required: 'Start date is required' })}
              />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                className="input"
                {...register('startTime', { required: 'Start time is required' })}
              />
            </div>
            <div>
              <label className="label">End Date (Optional)</label>
              <input type="date" className="input" {...register('endDate')} />
            </div>
            <div>
              <label className="label">End Time (Optional)</label>
              <input type="time" className="input" {...register('endTime')} />
            </div>
          </div>
        </div>

        {/* Admission */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Admission
          </h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-500"
                {...register('isFree')}
              />
              <span className="ml-2 text-sm text-gray-700">This is a free event</span>
            </label>

            {!isFree && (
              <div>
                <label className="label">Cover Charge ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  {...register('coverCharge', { valueAsNumber: true })}
                />
              </div>
            )}

            <div>
              <label className="label">Age Restriction</label>
              <select className="input" {...register('ageRestriction', { valueAsNumber: true })}>
                <option value="">No restriction</option>
                <option value="18">18+</option>
                <option value="19">19+</option>
                <option value="21">21+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Additional Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label">Dress Code (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Smart Casual, No Flip Flops"
                {...register('dressCode')}
              />
            </div>

            <div>
              <label className="label">Capacity (Optional)</label>
              <input
                type="number"
                className="input"
                placeholder="Leave blank for no limit"
                {...register('capacity', { valueAsNumber: true })}
              />
              <p className="mt-1 text-sm text-gray-500">
                Set a maximum number of RSVPs for this event
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
