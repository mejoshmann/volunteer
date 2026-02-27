import { Users, RefreshCw, X, Mail, Phone } from "lucide-react";

const VolunteerDirectoryModal = ({
  isOpen,
  onClose,
  volunteers,
  onRefresh,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <Users size={28} className="mr-3 text-purple-600" />
            Volunteer Directory ({volunteers.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh volunteer list"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              <span className="text-sm font-medium hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Stacked Card View - All Screens */}
          <div className="space-y-4">
            {volunteers.length > 0 ? (
              volunteers.map((v) => (
                <div key={v.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {v.first_name} {v.last_name}
                    </h4>
                    <p className="text-gray-600 flex items-center text-sm">
                      <Mail size={16} className="mr-2 text-blue-500" /> 
                      <a href={`mailto:${v.email}`} className="hover:underline">{v.email}</a>
                    </p>
                    <p className="text-gray-800 flex items-center font-medium text-sm">
                      <Phone size={16} className="mr-2 text-green-600" /> 
                      <a href={`tel:${v.mobile}`} className="hover:underline">{v.mobile || "N/A"}</a>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-semibold text-gray-700">Children:</span> {v.children_names || "N/A"}
                    </p>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        v.training_mountain === 'Grouse' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {v.training_mountain}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 italic">
                No volunteers found in the database.
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDirectoryModal;
