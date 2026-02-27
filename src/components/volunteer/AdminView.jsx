import { Trash2 } from "lucide-react";
import Calendar from "./Calendar";
import VolunteerManagement from "./VolunteerManagement";

const AdminView = ({
  // Calendar props
  calendarDays,
  currentDate,
  monthYearLabel,
  onPreviousMonth,
  onNextMonth,
  onToday,
  opportunities,
  selectedOpportunities,
  onSelectAll,
  onToggleSelection,
  onOpportunityClick,
  onEditOpportunity,
  onDeleteOpportunity,
  isSignedUp,
  
  // Resizable panel props
  calendarSplit,
  onDragStart,
  
  // Volunteer management props
  highlightedOpportunity,
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
  const hasSelection = selectedOpportunities.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      {/* Admin Controls */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={onSelectAll}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          {selectedOpportunities.length === opportunities.length ? 'Deselect All' : 'Select All'}
        </button>
        {hasSelection && (
          <button
            onClick={() => onDeleteOpportunity()}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-1"
          >
            <Trash2 size={14} />
            <span>Delete ({selectedOpportunities.length})</span>
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{monthYearLabel}</h2>
        <div className="flex space-x-2">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
          <button
            onClick={onToday}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div id="admin-main-content" className="flex-1 flex flex-col overflow-hidden">
        <div style={{ height: `${calendarSplit}%`, minHeight: '150px' }} className="overflow-auto">
          <Calendar
            calendarDays={calendarDays}
            currentView="admin"
            isSignedUp={isSignedUp}
            selectedOpportunities={selectedOpportunities}
            toggleOpportunitySelection={onToggleSelection}
            handleOpportunityClick={onOpportunityClick}
            setEditingOpportunity={onEditOpportunity}
            deleteOpportunity={onDeleteOpportunity}
            removeSignup={() => {}}
            quickSignUp={() => {}}
          />
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={onDragStart}
          className="h-4 flex items-center justify-center cursor-row-resize hover:bg-gray-100 transition-colors my-1 rounded"
          title="Drag to resize"
        >
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Volunteer Management */}
        <VolunteerManagement
          opportunities={opportunities}
          calendarSplit={calendarSplit}
          highlightedOpportunity={highlightedOpportunity}
          onOpportunityClick={onOpportunityClick}
          onSendReminder={onSendReminder}
          onSendMessage={onSendMessage}
          onRemoveVolunteer={onRemoveVolunteer}
          sendingReminder={sendingReminder}
          sentReminders={sentReminders}
          sendingMessage={sendingMessage}
          sentMessages={sentMessages}
          messageTarget={messageTarget}
          removingVolunteer={removingVolunteer}
        />
      </div>
    </div>
  );
};

export default AdminView;
