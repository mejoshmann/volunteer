import { X } from "lucide-react";

const EditInfoModal = ({
  isOpen,
  onClose,
  content,
  setContent,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Edit Important Information
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Ski Pass Requirements</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows="6"
              value={content.skiPassInfo}
              onChange={(e) => setContent({...content, skiPassInfo: e.target.value})}
              placeholder="Enter ski pass requirements..."
            />
            <p className="text-xs text-gray-500 mt-1">Use **text** for bold. Use \n for new lines.</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">On-Snow Tasks</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows="6"
              value={content.onSnowTasks}
              onChange={(e) => setContent({...content, onSnowTasks: e.target.value})}
              placeholder="Enter on-snow tasks..."
            />
            <p className="text-xs text-gray-500 mt-1">Use **text** for bold. Use \n for new lines.</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Off-Snow Tasks</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows="6"
              value={content.offSnowTasks}
              onChange={(e) => setContent({...content, offSnowTasks: e.target.value})}
              placeholder="Enter off-snow tasks..."
            />
            <p className="text-xs text-gray-500 mt-1">Use **text** for bold. Use \n for new lines.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Reminder Email Message</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows="4"
              value={content.reminderMessage}
              onChange={(e) => setContent({...content, reminderMessage: e.target.value})}
              placeholder="Enter the reminder email message..."
            />
            <p className="text-xs text-gray-500 mt-1">This message will appear in reminder emails sent to volunteers.</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInfoModal;
