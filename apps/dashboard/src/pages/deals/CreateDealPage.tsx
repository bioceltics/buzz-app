import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, Image, Video, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

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
}

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export function CreateDealPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { venue } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DealForm>();

  const dealType = watch('type');
  const isRecurring = watch('isRecurring');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaFile[] = [];

    Array.from(files).forEach((file) => {
      if (mediaFiles.length + newFiles.length >= 5) {
        toast.error('Maximum 5 media files allowed');
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error('Only images and videos are allowed');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video',
      });
    });

    setMediaFiles([...mediaFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((m) => m.id !== id));
  };

  const onSubmit = async (data: DealForm) => {
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
      const endTime = new Date(`${data.endDate}T${data.endTime}`).toISOString();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          venue_id: venue.id,
          title: data.title,
          description: data.description,
          type: data.type || 'flash_deal',
          discount_type: data.discountType || 'percentage',
          discount_value: data.discountValue || undefined,
          original_price: data.originalPrice || undefined,
          start_time: startTime,
          end_time: endTime,
          terms: data.terms || undefined,
          max_redemptions: data.maxRedemptions || undefined,
          recurring_days: data.isRecurring ? data.recurringDays : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }

      toast.success('Deal created successfully!');
      navigate('/deals');
    } catch (error) {
      console.error('Create deal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Deals
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
        <p className="text-gray-600">Set up a new promotion for your customers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Deal Title</label>
              <input
                type="text"
                className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
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
                className="input w-full min-h-[100px] resize-y"
                placeholder="Describe your deal..."
                {...register('description')}
              />
            </div>

            <div>
              <label className="label">Deal Type</label>
              <select className="input w-full" {...register('type', { required: true })}>
                <option value="">Select type...</option>
                <option value="happy_hour">Happy Hour</option>
                <option value="flash_deal">Flash Deal</option>
                <option value="recurring">Recurring Special</option>
                <option value="event">Event Special</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Deal Media</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add photos or videos to make your deal more attractive. The first image will be used as the cover.
          </p>

          {/* Media Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {mediaFiles.map((media, index) => (
              <div
                key={media.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 group"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.preview}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Cover badge for first image */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">
                    Cover
                  </div>
                )}
                {/* Type indicator */}
                <div className="absolute bottom-2 left-2">
                  {media.type === 'image' ? (
                    <Image className="w-4 h-4 text-white drop-shadow-lg" />
                  ) : (
                    <Video className="w-4 h-4 text-white drop-shadow-lg" />
                  )}
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeMedia(media.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload button */}
            {mediaFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">Add Media</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              Images: JPG, PNG, GIF
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              Videos: MP4, MOV (max 50MB)
            </span>
            <span>{mediaFiles.length}/5 files</span>
          </div>
        </div>

        {/* Discount Details */}
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Type</label>
              <select className="input w-full" {...register('discountType')}>
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
                className="input w-full"
                placeholder="e.g., 20"
                {...register('discountValue', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="label">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="input w-full"
                placeholder="0.00"
                {...register('originalPrice', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Daily Redemption Limit */}
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Redemption Limit</h3>
          <p className="text-sm text-gray-500 mb-4">
            Control how many customers can redeem this deal. When the limit is reached, the deal automatically becomes unavailable.
          </p>

          <div>
            <label className="label">Available Spots</label>
            <input
              type="number"
              className="input w-full sm:max-w-xs"
              placeholder="e.g., 50 (leave blank for unlimited)"
              {...register('maxRedemptions', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Leave blank for unlimited redemptions</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule</h3>
          <p className="text-sm text-gray-500 mb-4">
            Set when your deal goes live and when it ends. The deal will automatically start and stop at these times.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-700">
                  <strong>Tip:</strong> You can pause or stop any live deal at any time from the Deals dashboard.
                </p>
              </div>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input w-full" {...register('startDate')} />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input w-full" {...register('startTime')} />
              <p className="mt-1 text-xs text-gray-400">Deal goes live at this time</p>
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input w-full" {...register('endDate')} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input w-full" {...register('endTime')} />
              <p className="mt-1 text-xs text-gray-400">Deal expires at this time</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-500 flex-shrink-0"
                {...register('isRecurring')}
              />
              <span className="ml-2 text-sm text-gray-700">This is a recurring deal</span>
            </label>
          </div>

          {isRecurring && (
            <div className="mt-4">
              <label className="label">Recurring Days</label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label
                    key={day}
                    className="flex items-center justify-center w-11 h-11 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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
        <div className="card overflow-visible">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <textarea
            className="input w-full min-h-[100px] resize-y"
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
                Creating...
              </>
            ) : (
              'Create Deal'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
