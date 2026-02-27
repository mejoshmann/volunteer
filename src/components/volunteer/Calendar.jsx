import { Edit, Trash2, X } from "lucide-react";

const Calendar = ({
  calendarDays,
  currentView,
  isSignedUp,
  selectedOpportunities,
  toggleOpportunitySelection,
  handleOpportunityClick,
  setEditingOpportunity,
  deleteOpportunity,
  removeSignup,
  quickSignUp,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          
          if (!day.isCurrentMonth) {
            return (
              <div
                key={index}
                className="bg-gray-50 min-h-[120px]"
              >
              </div>
            );
          }
          
          return (
            <div
              key={index}
              className={`bg-white p-3 min-h-[120px] flex flex-col hover:bg-gray-50/50 transition-colors ${
                isToday ? "bg-blue-50/30" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? "bg-blue-600 text-white shadow-sm" : "text-gray-900"
                }`}>
                  {day.date.getDate()}
                </span>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                {day.opportunities.map((opportunity) => {
                  const signedUpCount = opportunity.signups ? opportunity.signups.length : 0;
                  const userIsSignedUp = isSignedUp(opportunity);
                  const isFull = signedUpCount >= opportunity.max_volunteers;
                  
                  return (
                    <div
                      key={opportunity.id}
                      onClick={() => currentView === "admin" && handleOpportunityClick(opportunity.id)}
                      className={`text-xs p-1.5 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        opportunity.type === "on-snow"
                          ? "bg-blue-50 text-blue-900 border border-blue-200"
                          : "bg-green-50 text-green-900 border border-green-200"
                      } ${userIsSignedUp ? "ring-2 ring-offset-1 ring-green-500" : ""} ${
                        currentView === "admin" && selectedOpportunities.includes(opportunity.id) ? "ring-2 ring-red-500" : ""
                      } ${currentView === "admin" ? "hover:ring-2 hover:ring-purple-300" : ""}`}
                    >
                      {currentView === "admin" && (
                        <div className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={selectedOpportunities.includes(opportunity.id)}
                            onChange={() => toggleOpportunitySelection(opportunity.id)}
                            className="mr-1.5 h-3 w-3 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label className="text-[10px] text-gray-600">Select</label>
                        </div>
                      )}
                      <div className="font-bold truncate">{opportunity.title}</div>
                      <div className="font-semibold">
                        {opportunity.time}{opportunity.end_time ? ` - ${opportunity.end_time}` : ''}
                      </div>
                      <div className="truncate opacity-75 text-[11px]">{opportunity.location}</div>
                      {opportunity.description && (
                        <div className="text-[11px] opacity-60 truncate mt-0.5">{opportunity.description}</div>
                      )}
                      <div className="text-xs opacity-75 mt-1">
                        {signedUpCount}/{opportunity.max_volunteers} signed up
                      </div>
                      {currentView === "admin" && (
                        <div className="flex space-x-1 mt-1">
                          <button
                            onClick={() => setEditingOpportunity(opportunity)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded"
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => deleteOpportunity(opportunity.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      {currentView === "volunteer" && (
                        <>
                          {userIsSignedUp ? (
                            <button
                              onClick={() => removeSignup(opportunity.id)}
                              className="w-full mt-1 px-1 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium"
                            >
                              <X size={10} className="inline mr-1" />
                              Remove
                            </button>
                          ) : isFull ? (
                            <div className="w-full mt-1 px-1 py-1 bg-gray-300 text-gray-700 text-xs rounded text-center font-medium">
                              Full
                            </div>
                          ) : (
                            <button
                              onClick={() => quickSignUp(opportunity.id)}
                              className="w-full mt-1 px-1 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium"
                            >
                              Sign Up
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
