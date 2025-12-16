import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface DealForm {
  title: string;
  description: string;
  type: string;
  discountType: string;
  discountValue: number;
  originalPrice: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  terms: string;
  maxRedemptions: number;
  isRecurring: boolean;
  recurringDays: number[];
  isActive: boolean;
}

export function EditDealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DealForm>();

  const isRecurring = watch('isRecurring');

  // Fetch deal data
  useEffect(() => {
    async function fetchDeal() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const startDate = new Date(data.start_time);
          const endDate = new Date(data.end_time);

          reset({
            title: data.title,
            description: data.description,
            type: data.type,
            discountType: data.discount_type,
            discountValue: data.discount_value,
            originalPrice: data.original_price,
            startDate: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endDate: endDate.toISOString().split('T')[0],
            endTime: endDate.toTimeString().slice(0, 5),
            terms: data.terms || '',
            maxRedemptions: data.max_redemptions,
            isRecurring: data.type === 'recurring',
            recurringDays: data.recurring_days || [],
            isActive: data.is_active,
          });
        }
      } catch (error) {
        console.error('Fetch deal error:', error);
        toast.error('Failed to load deal');
        navigate('/deals');
      } finally {
        setIsFetching(false);
      }
    }

    if (id) {
      fetchDeal();
    }
  }, [id, reset, navigate]);

  const onSubmit = async (data: DealForm) => {
    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      const startTime = new Date(`${data.startDate}T${data.startTime}`).toISOString();
      const endTime = new Date(`${data.endDate}T${data.endTime}`).toISOString();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.isRecurring ? 'recurring' : data.type,
          discount_type: data.discountType,
          discount_value: data.discountValue || undefined,
          original_price: data.originalPrice || undefined,
          start_time: startTime,
          end_time: endTime,
          terms: data.terms || undefined,
          max_redemptions: data.maxRedemptions || undefined,
          recurring_days: data.isRecurring ? data.recurringDays : undefined,
          is_active: data.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update deal');
      }

      toast.success('Deal updated successfully!');
      navigate('/deals');
    } catch (error) {
      console.error('Update deal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      toast.success('Deal deleted');
      navigate('/deals');
    } catch (error) {
      console.error('Delete deal error:', error);
      toast.error('Failed to delete deal');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Deals
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Delete Deal
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
        <p className="text-gray-600">Update your deal information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Toggle */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Deal Status</h3>
              <p className="text-sm text-gray-500">Toggle to activate or deactivate this deal</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('isActive')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Deal Title</label>
              <input
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Happy Hour Special"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Describe your deal..."
                {...register('description')}
              />
            </div>

            <div>
              <label className="label">Deal Type</label>
              <select className="input" {...register('type', { required: true })}>
                <option value="">Select type...</option>
                <option value="happy_hour">Happy Hour</option>
                <option value="flash_deal">Flash Deal</option>
                <option value="recurring">Recurring Special</option>
                <option value="event_special">Event Special</option>
              </select>
            </div>
          </div>
        </div>

        {/* Discount Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Type</label>
              <select className="input" {...register('discountType')}>
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="bogo">Buy One Get One</option>
                <option value="free_item">Free Item</option>
              </select>
            </div>

            <div>
              <label className="label">Discount Value</label>
              <input
                type="number"
                className="input"
                placeholder="e.g., 20"
                {...register('discountValue', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="label">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
                {...register('originalPrice', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="label">Max Redemptions</label>
              <input
                type="number"
                className="input"
                placeholder="Leave blank for unlimited"
                {...register('maxRedemptions', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" {...register('startDate')} />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input" {...register('startTime')} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" {...register('endDate')} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input" {...register('endTime')} />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-500"
                {...register('isRecurring')}
              />
              <span className="ml-2 text-sm text-gray-700">This is a recurring deal</span>
            </label>
          </div>

          {isRecurring && (
            <div className="mt-4">
              <label className="label">Recurring Days</label>
              <div className="flex gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label
                    key={day}
                    className="flex items-center justify-center w-12 h-12 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={index}
                      className="sr-only"
                      {...register('recurringDays')}
                    />
                    <span className="text-sm font-medium">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <textarea
            className="input min-h-[100px]"
            placeholder="Add any terms and conditions..."
            {...register('terms')}
          />
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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Deal?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All redemption data will be preserved but the deal will no longer be available.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
