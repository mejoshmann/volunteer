import React, { useState } from 'react';
import MyCalendar from './components/calendar/MyCalendar';
import './App.scss';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [volunteers, setVolunteers] = useState({});

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleAddVolunteer = (type, name) => {
    if (!name || !selectedDate) return;

    setVolunteers((prevVolunteers) => {
      const dateStr = selectedDate.toDateString();
      const updatedDay = {
        ...prevVolunteers[dateStr],
        [type]: [...(prevVolunteers[dateStr]?.[type] || []), name],
      };

      return {
        ...prevVolunteers,
        [dateStr]: updatedDay,
      };
    });
  };

  const handleRemoveVolunteer = (type, name) => {
    if (!selectedDate) return;

    setVolunteers((prevVolunteers) => {
      const dateStr = selectedDate.toDateString();
      const updatedDay = {
        ...prevVolunteers[dateStr],
        [type]: prevVolunteers[dateStr]?.[type]?.filter((vol) => vol !== name),
      };

      return {
        ...prevVolunteers,
        [dateStr]: updatedDay,
      };
    });
  };

  return (
    <div className="app">
      <div className="calendar-section">
        <MyCalendar onDayClick={handleDayClick} />
      </div>
      <div className="task-section">
        {selectedDate ? (
          <div>
            <h2>Volunteer Opportunities for {selectedDate.toDateString()}</h2>
            <div>
              <h3>On Snow</h3>
              <VolunteerInput
                type="onSnow"
                volunteers={volunteers[selectedDate?.toDateString()]?.onSnow || []}
                onAddVolunteer={handleAddVolunteer}
                onRemoveVolunteer={handleRemoveVolunteer}
              />
            </div>
            <div>
              <h3>Off Snow</h3>
              <VolunteerInput
                type="offSnow"
                volunteers={volunteers[selectedDate?.toDateString()]?.offSnow || []}
                onAddVolunteer={handleAddVolunteer}
                onRemoveVolunteer={handleRemoveVolunteer}
              />
            </div>
          </div>
        ) : (
          <p>Please select a day on the calendar.</p>
        )}
      </div>
    </div>
  );
};

const VolunteerInput = ({ type, volunteers, onAddVolunteer, onRemoveVolunteer }) => {
  const [name, setName] = useState('');

  const maxVolunteers = 2; // This value is fixed in this component.
  const isSlotAvailable = volunteers.length < maxVolunteers;

  return (
    <div>
      {isSlotAvailable ? (
        <>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={() => onAddVolunteer(type, name)}>Add</button>
        </>
      ) : (
        <p>All volunteer tasks are full</p>
      )}
      <ul>
        {volunteers.map((volunteer, index) => (
          <li key={index}>
            {volunteer}
            <button onClick={() => onRemoveVolunteer(type, volunteer)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
