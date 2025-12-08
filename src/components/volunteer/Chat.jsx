import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Users as UsersIcon, Trash2 } from 'lucide-react';

const Chat = ({ 
  chatRooms, 
  selectedChatRoom, 
  setSelectedChatRoom, 
  messages, 
  newMessage, 
  setNewMessage, 
  handleSendMessage,
  handleDeleteMessage,
  currentVolunteer 
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Removed auto-select to allow users to explicitly choose a chat room

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Room Selector */}
      <div className="border-b p-4 flex-shrink-0">
        <select
          value={selectedChatRoom?.id || ''}
          onChange={(e) => {
            const room = chatRooms.find(r => r.id === e.target.value);
            setSelectedChatRoom(room || null);
          }}
          className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        >
          {chatRooms.length === 0 ? (
            <option value="">No chat rooms available</option>
          ) : (
            <option value="">Select a chat room...</option>
          )}
          {chatRooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name}
              {room.type === 'club_notifications' && ' 📢'}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedChatRoom ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>Select a chat room to start messaging</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Safety checks for iOS Safari
            if (!msg || !msg.id) return null;
            
            const isOwnMessage = msg.sender?.id === currentVolunteer?.id;
            const senderFirstName = msg.sender?.first_name || 'Unknown';
            const senderLastName = msg.sender?.last_name || '';
            const messageContent = msg.content || '';
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  style={{ maxWidth: '70%' }}
                  className={`rounded-lg px-4 py-2 relative ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Always show sender name */}
                  <div className={`text-xs font-semibold mb-1 inline-block px-2 py-0.5 rounded border ${
                    isOwnMessage 
                      ? 'text-blue-100 border-amber-400' 
                      : 'opacity-75 border-amber-500'
                  }`}>
                    {senderFirstName} {senderLastName}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {messageContent}
                  </div>
                  <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(msg.created_at)}
                  </div>
                  {/* Delete button - only show for own messages */}
                  {isOwnMessage && handleDeleteMessage && (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this message?')) {
                          handleDeleteMessage(msg.id);
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedChatRoom ? "Type a message..." : "Select a room first..."}
            disabled={!selectedChatRoom}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !selectedChatRoom}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              newMessage.trim() && selectedChatRoom
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
