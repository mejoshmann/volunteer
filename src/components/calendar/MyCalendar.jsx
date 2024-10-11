import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MyCalendar = ({ onDayClick }) => {
  return (
    <Calendar
      localizer={localizer}
      selectable={true}
      onSelectSlot={(slotInfo) => onDayClick(slotInfo.start)} // Pass selected date
      style={{ height: 500 }}
      // Remove dayPropGetter for now
    />
  );
};

export default MyCalendar;
