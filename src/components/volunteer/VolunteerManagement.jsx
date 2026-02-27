import { useRef } from "react";
import { Mail, Check, Send, RefreshCw, X, Trash2, Phone } from "lucide-react";

const VolunteerManagement = ({
  opportunities,
  calendarSplit,
  highlightedOpportunity,
  onOpportunityClick,
  onSendReminder,
  onSendMessage,
  onRemoveVolunteer,
  sendingReminder,
  sentReminders,
  sendingMessage,
  sentMessages,
  messageTarget,
  removingVolunteer,
}) => {
  const opportunityRefs = useRef({});

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const todayOpportunities = opportunities.filter(opp => opp.date === todayStr);
  const upcomingOpportunities = opportunities.filter(opp => opp.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastOpportunities = opportunities.filter(opp => opp.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  const renderOpportunityCard = (opportunity, isPast = false, isToday = false) => {
    const signups = opportunity.signups || [];
    return (
      <div
        key={opportunity.id}
        ref={(el) => { opportunityRefs.current[opportunity.id] = el; }}
        className={`border-2 rounded-xl p-4 transition-all duration-500 ${
          highlightedOpportunity === opportunity.id
            ? "border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-300"
            : isPast ? "border-gray-200 bg-gray-50 opacity-75" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-base text-gray-700">{opportunity.title}</h4>
            <p className="text-xs font-medium text-gray-500">
              {new Date(opportunity.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {opportunity.time} - {opportunity.location}
            </p>
          </div>
          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
            opportunity.type === "on-snow" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
          }`}>
            {opportunity.type}
          </span>
        </div>
        <div className="text-sm">
          <strong className="text-gray-600">Volunteers ({signups.length}/{opportunity.max_volunteers}):</strong>
          {signups.length > 0 ? (
            <div className="mt-2 space-y-2">
              {signups.map((signup) => {
                const volunteer = signup.volunteer;
                if (!volunteer) return null;
                return (
                  <div key={signup.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between col-span-1 sm:col-span-2 pb-1 border-b border-gray-50">
                        <div className="flex space-x-4">
                          <div><strong>Name:</strong> {volunteer.first_name} {volunteer.last_name}</div>
                          <div><strong>Email:</strong> {volunteer.email}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onSendMessage(volunteer)}
                            disabled={sendingMessage && messageTarget?.id === volunteer.id}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              sentMessages.has(volunteer.id)
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                            }`}
                          >
                            {sentMessages.has(volunteer.id) ? (
                              <><Check size={10} /><span>Message Sent</span></>
                            ) : (
                              <><Mail size={10} className={sendingMessage && messageTarget?.id === volunteer.id ? "animate-pulse" : ""} /><span>{sendingMessage && messageTarget?.id === volunteer.id ? "Sending..." : "Send Message"}</span></>
                            )}
                          </button>
                          <button
                            onClick={() => onSendReminder(signup.id)}
                            disabled={sendingReminder === signup.id || sentReminders.has(signup.id)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              sentReminders.has(signup.id)
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : sendingReminder === signup.id
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            }`}
                          >
                            {sentReminders.has(signup.id) ? (
                              <><Check size={10} /><span>Reminder Sent</span></>
                            ) : (
                              <><Send size={10} className={sendingReminder === signup.id ? "animate-pulse" : ""} /><span>{sendingReminder === signup.id ? "Sending..." : "Send Reminder"}</span></>
                            )}
                          </button>
                          <button
                            onClick={() => onRemoveVolunteer(signup.id, `${volunteer.first_name} ${volunteer.last_name}`)}
                            disabled={removingVolunteer === signup.id}
                            className="flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                          >
                            {removingVolunteer === signup.id ? (
                              <><RefreshCw size={10} className="animate-spin" /><span>Removing...</span></>
                            ) : (
                              <><X size={10} /><span>Remove</span></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div><strong>Phone:</strong> {volunteer.mobile || 'N/A'}</div>
                    <div><strong>Mountain:</strong> {volunteer.training_mountain}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 mt-1">No volunteers signed up yet</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: `${100 - calendarSplit - 2}%`, minHeight: '150px' }} className="overflow-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4">
          <h3 className="text-xl font-extrabold text-gray-900">Volunteer Management</h3>
          <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
            Admin Control
          </div>
        </div>

        <>
          {pastOpportunities.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <h4 className="text-lg font-bold text-gray-500">Past Tasks</h4>
              </div>
              <div className="space-y-6 opacity-75">
                {pastOpportunities.reverse().map((opp) => renderOpportunityCard(opp, true))}
              </div>
              <div className="mt-8 mb-4 border-b border-gray-200"></div>
            </div>
          )}

          {todayOpportunities.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-blue-700">Today's Tasks</h4>
              </div>
              <div className="space-y-6">
                {todayOpportunities.map((opp) => renderOpportunityCard(opp, false, true))}
              </div>
              <div className="mt-8 mb-4 border-b border-gray-100"></div>
            </div>
          )}

          <div className="px-2 mb-4">
            <h4 className="text-base font-bold text-gray-900">Upcoming Tasks</h4>
          </div>
          <div className="space-y-4">
            {upcomingOpportunities.map((opp) => renderOpportunityCard(opp))}
          </div>
        </>
      </div>
    </div>
  );
};

export default VolunteerManagement;
