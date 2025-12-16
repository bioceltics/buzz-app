import { MessageSquare } from 'lucide-react';

export function ChatPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Chat with your customers</p>
      </div>

      <div className="card text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
        <p className="text-gray-600">
          When customers message you, they'll appear here
        </p>
      </div>
    </div>
  );
}
