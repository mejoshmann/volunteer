import { X, RefreshCw, Send, Mail } from "lucide-react";

const MessageModal = ({
  isOpen,
  onClose,
  target,
  subject,
  setSubject,
  body,
  setBody,
  onSend,
  isSending,
}) => {
  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Mail size={24} className="mr-2 text-purple-600" />
            Send Message
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">To:</p>
          <p className="font-semibold text-gray-900">
            {target.first_name} {target.last_name}
          </p>
          <p className="text-sm text-gray-500">{target.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="6"
              placeholder="Type your personal message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">This will be sent as an email to the volunteer.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={isSending || !subject.trim() || !body.trim()}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                isSending || !subject.trim() || !body.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isSending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
