import Calendar from "./Calendar";

const VolunteerView = ({
  calendarDays,
  monthYearLabel,
  onPreviousMonth,
  onNextMonth,
  onToday,
  isSignedUp,
  removeSignup,
  quickSignUp,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
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

      {/* Calendar Grid - Full Height */}
      <div className="flex-1 overflow-auto">
        <Calendar
          calendarDays={calendarDays}
          currentView="volunteer"
          isSignedUp={isSignedUp}
          selectedOpportunities={[]}
          toggleOpportunitySelection={() => {}}
          handleOpportunityClick={() => {}}
          setEditingOpportunity={() => {}}
          deleteOpportunity={() => {}}
          removeSignup={removeSignup}
          quickSignUp={quickSignUp}
        />
      </div>
    </div>
  );
};

export default VolunteerView;
