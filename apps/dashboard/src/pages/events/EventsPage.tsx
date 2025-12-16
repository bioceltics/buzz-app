import { Plus, Calendar } from 'lucide-react';

export function EventsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your venue's events and activities</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>

      <div className="card text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600 mb-4">
          Create your first event to start attracting customers
        </p>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Event
        </button>
      </div>
    </div>
  );
}
